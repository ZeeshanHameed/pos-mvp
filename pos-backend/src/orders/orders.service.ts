import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { FIRESTORE } from '../firebase/tokens';
import type { Firestore } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';
import { v4 as uuid } from 'uuid';
import { QueueService } from '../cache/queue.service';
import { AuditService } from '../audit/audit.service';
import { OrdersGateway } from './orders.gateway';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  constructor(
    @Inject(FIRESTORE) private readonly db: Firestore,
    private readonly queue: QueueService,
    private readonly audit: AuditService,
    private readonly gateway: OrdersGateway,
  ) {}

  private ordersCol() {
    return this.db.collection('orders');
  }
  private menuCol() {
    return this.db.collection('menu_items');
  }

  async createOrder(input: {
    items: Array<{ id: string; name: string; price: number; qty: number }>;
    discount?: number;
    order_by?: any;
    order_type: 'online' | 'in-store';
    customer: {
      name: string;
      delivery_address?: string;
    };
    userId?: string;
  }) {
    // Create order immediately (data is already validated at DTO level)
    const total = input.items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const orderId = uuid();

    const orderDoc = {
      id: orderId,
      items: input.items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        qty: item.qty,
      })),
      total_price: total - (input.discount || 0),
      discount: input.discount || 0,
      order_status: 'Pending',
      order_date: admin.firestore.Timestamp.now(),
      order_by: input.order_by || null,
      order_type: input.order_type,
      customer: {
        name: input.customer.name,
        delivery_address: input.customer.delivery_address || null,
      },
      error_type: null,
      reason: null,
    };

    // Debug logging
    this.logger.debug(`Creating order ${orderId} with order_by: ${JSON.stringify(input.order_by)}`);
    this.logger.debug(`Order document order_by field: ${JSON.stringify(orderDoc.order_by)}`);

    // Process in background (don't wait)
    this.processOrderInBackground(orderDoc, input.items, input.userId).catch(
      (err) => {
        this.logger.error(
          `Background order processing failed for ${orderId}:`,
          err,
        );
      },
    );

    // Return order ID and initial order data so customer can track immediately
    return { orderId, order: orderDoc };
  }

  /**
   * Background processing: check stock, sync to Firestore, handle errors
   */
  private async processOrderInBackground(
    orderDoc: any,
    items: Array<{ id: string; name: string; price: number; qty: number }>,
    userId?: string,
  ) {
    const orderId = orderDoc.id;

    try {
      // Check if Firestore is reachable
      const menuDocs = await this.menuCol()
        .where(
          'id',
          'in',
          items.map((i) => i.id),
        )
        .get()
        .catch(() => null);

      if (!menuDocs) {
        // Firestore unreachable -> queue for later
        this.logger.warn(
          `Firestore unreachable for order ${orderId}, queuing...`,
        );
        await this.queue.enqueue('createOrder', {
          order: orderDoc,
          itemsToDecrement: items,
        });
        return;
      }

      // Verify stock availability
      const menuMap = new Map(menuDocs.docs.map((d) => [d.id, d.data()]));
      for (const it of items) {
        const menuItem = menuMap.get(it.id);
        if (!menuItem) {
          // Item not found - cancel order
          await this.cancelOrderWithError(
            orderId,
            'item_not_found',
            `Item ${it.name} not found in menu`,
            orderDoc,
          );
          return;
        }

        const stock = menuItem.remaining_stock as number;
        if (stock < it.qty) {
          // Out of stock - cancel order
          await this.cancelOrderWithError(
            orderId,
            'out_of_stock',
            `${it.name} is out of stock (available: ${stock}, requested: ${it.qty})`,
            orderDoc,
          );
          return;
        }
      }

      // All checks passed - create order and decrement stock in transaction
      // IMPORTANT: Firestore requires ALL reads before ANY writes in a transaction
      await this.db.runTransaction(async (tx) => {
        // Step 1: Perform ALL reads first
        const snapshots = await Promise.all(
          items.map((it) => tx.get(this.menuCol().doc(it.id))),
        );

        // Step 2: Validate all reads
        for (let i = 0; i < items.length; i++) {
          const snap = snapshots[i];
          const it = items[i];
          if (!snap.exists) {
            throw new Error(`Item not found: ${it.id}`);
          }
          const data = snap.data() as any;
          if (data.remaining_stock < it.qty) {
            throw new Error(`Insufficient stock for ${data.name}`);
          }
        }

        // Step 3: Perform ALL writes after all reads are complete
        for (let i = 0; i < items.length; i++) {
          const it = items[i];
          const snap = snapshots[i];
          const data = snap.data() as any;
          tx.update(this.menuCol().doc(it.id), {
            remaining_stock: (data.remaining_stock as number) - it.qty,
          });
        }
        tx.set(this.ordersCol().doc(orderId), orderDoc);
      });

      // Success - log and emit
      await this.audit.log('CREATE_ORDER', userId || 'system', { orderId });
      this.gateway.emitCreated(orderDoc);
      this.logger.log(`Order ${orderId} created successfully`);
    } catch (error) {
      // Transaction failed - queue for retry
      this.logger.error(
        `Failed to create order ${orderId}, queuing for retry:`,
        error,
      );
      await this.queue.enqueue('createOrder', {
        order: orderDoc,
        itemsToDecrement: items,
      });
    }
  }

  /**
   * Cancel order with error details
   */
  private async cancelOrderWithError(
    orderId: string,
    errorType: string,
    reason: string,
    orderDoc: any,
  ) {
    this.logger.warn(`Cancelling order ${orderId}: ${errorType} - ${reason}`);

    // Create the cancelled order document (not update, since it was never created)
    const cancelledOrderDoc = {
      ...orderDoc,
      order_status: 'Cancelled',
      error_type: errorType,
      reason: reason,
    };

    try {
      await this.ordersCol().doc(orderId).set(cancelledOrderDoc);
      this.gateway.emitCreated(cancelledOrderDoc);
    } catch (error) {
      // If Firestore create fails, queue it
      this.logger.error(
        `Failed to create cancelled order ${orderId}, queuing:`,
        error,
      );
      await this.queue.enqueue('createOrder', {
        order: cancelledOrderDoc,
        itemsToDecrement: [], // No stock to decrement for cancelled orders
      });
    }
  }

  async listOrders(params: {
    status?: string;
    start?: string;
    end?: string;
    limit?: number;
  }) {
    let q: FirebaseFirestore.Query = this.ordersCol();
    if (params.status) q = q.where('order_status', '==', params.status);
    if (params.start)
      q = q.where(
        'order_date',
        '>=',
        admin.firestore.Timestamp.fromDate(new Date(params.start)),
      );
    if (params.end)
      q = q.where(
        'order_date',
        '<=',
        admin.firestore.Timestamp.fromDate(new Date(params.end)),
      );
    q = q.orderBy('order_date', 'desc').limit(params.limit || 50);
    const snap = await q.get();
    return snap.docs.map((d) => d.data());
  }

  async getOrderById(id: string) {
    const doc = await this.ordersCol().doc(id).get();
    if (!doc.exists) throw new BadRequestException('Order not found');
    return doc.data();
  }

  async updateStatus(
    id: string,
    status: 'Pending' | 'In Progress' | 'Ready' | 'Completed',
    userId?: string,
  ) {
    const validTransitions: Record<string, string[]> = {
      Pending: ['In Progress'],
      'In Progress': ['Ready'],
      Ready: ['Completed'],
      Completed: [],
    };
    const doc = await this.ordersCol()
      .doc(id)
      .get()
      .catch(() => null);
    if (!doc || !doc.exists)
      throw new BadRequestException('Order not found');
    const current = (doc.data() as any).order_status as string;
    if (!validTransitions[current]?.includes(status))
      throw new BadRequestException(
        `Invalid status transition from ${current} to ${status}`,
      );

    try {
      await this.ordersCol().doc(id).update({ order_status: status });
    } catch {
      await this.queue.enqueue('updateOrderStatus', { id, status });
      return { pending: true, id };
    }

    await this.audit.log('UPDATE_ORDER_STATUS', userId || 'system', {
      id,
      status,
    });

    // Emit both updated and statusChanged events for real-time sync
    const updatedOrder = { ...(doc.data() as any), order_status: status };
    this.gateway.emitUpdated(updatedOrder);
    this.gateway.emitStatusChanged(id, status);

    return { id };
  }
}

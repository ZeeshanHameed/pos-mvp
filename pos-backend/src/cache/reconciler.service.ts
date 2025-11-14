import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { QueueService, QueuedOperation } from './queue.service';
import { FIRESTORE } from '../firebase/tokens';
import type { Firestore } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
import * as admin from 'firebase-admin';

@Injectable()
export class ReconcilerService implements OnModuleInit {
  private readonly logger = new Logger(ReconcilerService.name);
  private timer?: NodeJS.Timeout;

  constructor(
    private readonly queue: QueueService,
    @Inject(FIRESTORE) private readonly db: Firestore,
  ) {}

  async onModuleInit() {
    // Wait 2 seconds before starting to ensure QueueService is fully initialized
    setTimeout(() => {
      this.timer = setInterval(() => this.process(), 5000);
      this.logger.log('Reconciler background worker started');
    }, 2000);
  }

  private async process() {
    try {
      const ops = await this.queue.listPending();
      for (const op of ops) {
        try {
          await this.apply(op);
          await this.queue.remove(op.id);
          this.logger.log(`Successfully processed op ${op.id} (type: ${op.type})`);
        } catch (e) {
          op.attempts += 1;
          // Exponential backoff capped at 5 minutes
          const delay = Math.min(5 * 60_000, 1000 * Math.pow(2, op.attempts));
          op.nextAttemptAt = Date.now() + delay;
          await this.queue.update(op);
          this.logger.error(`Failed to process op ${op.id} (type: ${op.type}, attempt ${op.attempts}):`, e);
          this.logger.warn(`Retry scheduled for op ${op.id} in ${Math.round(delay / 1000)}s`);
        }
      }
    } catch (e) {
      // Silently skip if queue is not ready yet
      if ((e as any).code !== 'LEVEL_DATABASE_NOT_OPEN') {
        this.logger.error('Error processing queue', e);
      }
    }
  }

  private async apply(op: QueuedOperation): Promise<void> {
    switch (op.type) {
      case 'createOrder': {
        const { order, itemsToDecrement } = op.payload as any;
        const batch = this.db.batch();
        const orderRef = this.db.collection('orders').doc(order.id || uuidv4());
        // If items are missing (offline enqueue), rebuild from menu
        let orderData = order;
        if (!orderData.items || orderData.items.length === 0) {
          const ids = (itemsToDecrement as Array<{ id: string; qty: number }>).map((i) => i.id);
          const snap = await this.db.collection('menu_items').where('id', 'in', ids).get();
          const map = new Map(snap.docs.map((d) => [d.id, d.data() as any]));
          const itemsDetailed = (itemsToDecrement as Array<{ id: string; qty: number }>).map((it) => {
            const m = map.get(it.id) as any | undefined;
            return { id: it.id, name: m?.name ?? 'unknown', price: m?.price ?? 0, qty: it.qty };
          });
          const total = itemsDetailed.reduce((s, i) => s + i.price * i.qty, 0);
          orderData = { ...orderData, items: itemsDetailed, total_price: total - (orderData.discount || 0) };
        }
        batch.set(orderRef, orderData);
        for (const it of itemsToDecrement as Array<{ id: string; qty: number }>) {
          const itemId = it.id;
          if (!itemId) {
            throw new Error(`Invalid item id: ${itemId}`);
          }
          const ref = this.db.collection('menu_items').doc(itemId);
          const qtyNum = Number(it.qty);
          if (isNaN(qtyNum)) {
            throw new Error(`Invalid quantity for item ${itemId}: ${it.qty}`);
          }
          batch.update(ref, { remaining_stock: admin.firestore.FieldValue.increment(-qtyNum) } as any);
        }
        await batch.commit();
        return;
      }
      case 'updateOrderStatus': {
        const { id, status, error_type, reason } = op.payload as {
          id: string;
          status: string;
          error_type?: string;
          reason?: string;
        };
        // Check if document exists before updating
        const docRef = this.db.collection('orders').doc(id);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
          // Document doesn't exist - log warning and skip (don't retry)
          this.logger.warn(`Order ${id} not found, skipping status update to ${status}`);
          return;
        }

        const updateData: any = { order_status: status };
        if (error_type !== undefined) updateData.error_type = error_type;
        if (reason !== undefined) updateData.reason = reason;
        await docRef.update(updateData);
        return;
      }
      case 'decrementStock': {
        const { id, qty } = op.payload as { id: string; qty: number };
        const qtyNum = Number(qty);
        if (isNaN(qtyNum)) {
          throw new Error(`Invalid quantity for decrementStock: ${qty}`);
        }
        await this.db.collection('menu_items').doc(id).update({ remaining_stock: admin.firestore.FieldValue.increment(-qtyNum) } as any);
        return;
      }
      default:
        throw new Error(`Unknown op type ${(op as any).type}`);
    }
  }
}


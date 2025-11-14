import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Level } from 'level';
import { randomUUID } from 'crypto';

export type QueueOpType = 'createOrder' | 'updateOrderStatus' | 'decrementStock';

export interface QueuedOperation<T = any> {
  id: string;
  type: QueueOpType;
  payload: T;
  attempts: number;
  nextAttemptAt: number; // epoch ms
  createdAt: number; // epoch ms
}

@Injectable()
export class QueueService implements OnModuleInit {
  private readonly logger = new Logger(QueueService.name);
  private db!: Level<string, string>;
  private readonly DB_PATH = '.write-queue';
  private isReady = false;

  async onModuleInit() {
    this.db = new Level<string, string>(this.DB_PATH, { valueEncoding: 'utf8' });
    await this.db.open();
    this.isReady = true;
    this.logger.log('Write-queue LevelDB initialized');
  }

  private async ensureOpen() {
    if (!this.isReady || !this.db) {
      throw new Error('QueueService not initialized');
    }
    if (this.db.status !== 'open') {
      await this.db.open();
    }
  }

  async enqueue<T>(type: QueueOpType, payload: T, delayMs = 0): Promise<QueuedOperation<T>> {
    await this.ensureOpen();
    const id = randomUUID();
    const op: QueuedOperation<T> = {
      id,
      type,
      payload,
      attempts: 0,
      nextAttemptAt: Date.now() + delayMs,
      createdAt: Date.now(),
    };
    await this.db.put(id, JSON.stringify(op));
    return op;
  }

  async listPending(now = Date.now()): Promise<QueuedOperation[]> {
    await this.ensureOpen();
    const ops: QueuedOperation[] = [];
    for await (const [key, value] of this.db.iterator()) {
      try {
        const op = JSON.parse(value) as QueuedOperation;
        if (op.nextAttemptAt <= now) ops.push(op);
      } catch (e) {
        this.logger.warn(`Skipping corrupted queue entry ${key}`);
      }
    }
    return ops;
  }

  async update(op: QueuedOperation): Promise<void> {
    await this.ensureOpen();
    await this.db.put(op.id, JSON.stringify(op));
  }

  async remove(id: string): Promise<void> {
    await this.ensureOpen();
    await this.db.del(id);
  }
}


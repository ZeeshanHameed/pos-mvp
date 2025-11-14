import { Inject, Injectable } from '@nestjs/common';
import { FIRESTORE } from '../firebase/tokens';
import type { Firestore } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AuditService {
  constructor(@Inject(FIRESTORE) private readonly db: Firestore) {}

  async log(action: string, createdBy: string, details?: any) {
    const doc = {
      id: uuid(),
      action,
      createdBy,
      timestamp: admin.firestore.Timestamp.now(),
      details: details ?? null,
    };
    await this.db.collection('audit_logs').doc(doc.id).set(doc);
  }
}


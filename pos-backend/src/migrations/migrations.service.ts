import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { FIRESTORE } from '../firebase/tokens';
import type { Firestore } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';
import * as argon2 from 'argon2';

@Injectable()
export class MigrationsService implements OnModuleInit {
  private readonly logger = new Logger(MigrationsService.name);
  constructor(@Inject(FIRESTORE) private readonly db: Firestore) {}

  async onModuleInit() {
    await this.seedMenu();
    await this.seedUsers();
  }

  private async seedMenu() {
    const defaults = [
      { name: 'Pizza', price: 10, total_stock: 100, remaining_stock: 100 },
      { name: 'Burger', price: 7, total_stock: 100, remaining_stock: 100 },
      { name: 'Sandwich', price: 5, total_stock: 100, remaining_stock: 100 },
      { name: 'Icecream', price: 4, total_stock: 100, remaining_stock: 100 },
      { name: 'Cold drink', price: 3, total_stock: 100, remaining_stock: 100 },
      { name: 'Pasta', price: 8, total_stock: 100, remaining_stock: 0 },
    ];
    for (const item of defaults) {
      // Check if item with this name already exists
      const existingSnap = await this.db
        .collection('menu_items')
        .where('name', '==', item.name)
        .limit(1)
        .get();

      if (existingSnap.empty) {
        // Auto-generate ID
        const ref = this.db.collection('menu_items').doc();
        await ref.set({
          id: ref.id,
          ...item,
        });
        this.logger.log(`Seeded menu item ${item.name} with ID ${ref.id}`);
      }
    }
  }

  private async seedUsers() {
    const staffEmail = 'staff@demo.com';

    const staffSnap = await this.db
      .collection('users')
      .where('email', '==', staffEmail)
      .limit(1)
      .get();
    if (staffSnap.empty) {
      const hashed = await argon2.hash('DemoPos@123!');
      const ref = this.db.collection('users').doc();
      await ref.set({
        id: ref.id,
        name: 'Demo Staff',
        email: staffEmail,
        password: hashed,
        user_type: 'staff',
        last_login: admin.firestore.Timestamp.now(),
      });
      this.logger.log(
        'Seeded demo staff user (email: staff@demo.com, password: DemoPos@123!)',
      );
    }
  }
}

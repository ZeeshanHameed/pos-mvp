import { Inject, Injectable } from '@nestjs/common';
import { FIRESTORE } from '../firebase/tokens';
import type { Firestore } from 'firebase-admin/firestore';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class MenuService {
  private readonly cacheKey = 'menu:all';
  constructor(@Inject(FIRESTORE) private readonly db: Firestore, private readonly cache: CacheService) {}

  async listMenu() {
    try {
      const snap = await this.db.collection('menu_items').get();
      const items = snap.docs.map((d) => d.data());
      this.cache.set(this.cacheKey, items);
      return items;
    } catch (e) {
      const cached = this.cache.get<any[]>(this.cacheKey);
      if (cached) return cached;
      throw e;
    }
  }
}


import { Module } from '@nestjs/common';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { FirebaseModule } from '../firebase/firebase.module';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [FirebaseModule, CacheModule],
  controllers: [MenuController],
  providers: [MenuService],
})
export class MenuModule {}


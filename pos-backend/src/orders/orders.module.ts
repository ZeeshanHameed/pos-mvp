import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { FirebaseModule } from '../firebase/firebase.module';
import { CacheModule } from '../cache/cache.module';
import { AuditModule } from '../audit/audit.module';
import { OrdersGateway } from './orders.gateway';

@Module({
  imports: [FirebaseModule, CacheModule, AuditModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersGateway],
  exports: [OrdersService, OrdersGateway],
})
export class OrdersModule {}


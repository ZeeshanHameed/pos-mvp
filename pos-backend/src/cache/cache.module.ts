import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';
import { QueueService } from './queue.service';
import { ReconcilerService } from './reconciler.service';
import { FirebaseModule } from '../firebase/firebase.module';

@Global()
@Module({
  imports: [ConfigModule, FirebaseModule],
  providers: [
    {
      provide: CacheService,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => new CacheService(config.get<number>('CACHE_TTL_SECONDS') || 300),
    },
    QueueService,
    ReconcilerService,
  ],
  exports: [CacheService, QueueService],
})
export class CacheModule {}


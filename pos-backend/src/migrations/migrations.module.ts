import { Module } from '@nestjs/common';
import { FirebaseModule } from '../firebase/firebase.module';
import { MigrationsService } from './migrations.service';

@Module({
  imports: [FirebaseModule],
  providers: [MigrationsService],
})
export class MigrationsModule {}


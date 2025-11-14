import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FIREBASE_APP, FIRESTORE } from './tokens';
import * as admin from 'firebase-admin';
import * as path from 'path';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: FIREBASE_APP,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const serviceAccountPath = config.get<string>('FIREBASE_SERVICE_ACCOUNT_PATH');
        const projectId = config.get<string>('FIREBASE_PROJECT_ID');
        const already = admin.apps.length > 0 ? admin.app() : null;
        if (already) return already;

        if (!serviceAccountPath) {
          throw new Error('FIREBASE_SERVICE_ACCOUNT_PATH not set');
        }
        // Resolve path relative to project root
        const absolutePath = path.isAbsolute(serviceAccountPath)
          ? serviceAccountPath
          : path.resolve(process.cwd(), serviceAccountPath);
        const credential = admin.credential.cert(require(absolutePath));
        return admin.initializeApp({ credential, projectId });
      },
    },
    {
      provide: FIRESTORE,
      inject: [FIREBASE_APP],
      useFactory: (app: admin.app.App) => app.firestore(),
    },
  ],
  exports: [FIREBASE_APP, FIRESTORE],
})
export class FirebaseModule {}


import { Module, Global, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FIREBASE_APP, FIRESTORE } from './tokens';
import * as admin from 'firebase-admin';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: FIREBASE_APP,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const logger = new Logger('FirebaseModule');
        const already = admin.apps.length > 0 ? admin.app() : null;
        if (already) {
          logger.log('Firebase app already initialized');
          return already;
        }

        const projectId = config.get<string>('FIREBASE_PROJECT_ID');
        const serviceAccountJson = config.get<string>('FIREBASE_SERVICE_ACCOUNT');

        if (!serviceAccountJson) {
          throw new Error(
            'Firebase credentials not configured. Please set FIREBASE_SERVICE_ACCOUNT environment variable with your service account JSON string.'
          );
        }

        let credential: admin.credential.Credential;

        try {
          logger.log('Initializing Firebase with JSON string credentials');
          const serviceAccount = JSON.parse(serviceAccountJson);

          // Validate that it's a service account
          if (!serviceAccount.type || serviceAccount.type !== 'service_account') {
            throw new Error('Invalid service account JSON: missing or incorrect "type" field');
          }

          credential = admin.credential.cert(serviceAccount);
        } catch (error) {
          throw new Error(
            `Failed to parse FIREBASE_SERVICE_ACCOUNT JSON: ${error.message}`
          );
        }

        logger.log('Firebase Admin SDK initialized successfully');
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


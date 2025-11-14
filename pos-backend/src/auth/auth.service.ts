import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { FIRESTORE } from '../firebase/tokens';
import type { Firestore } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    @Inject(FIRESTORE) private readonly db: Firestore,
    private readonly config: ConfigService,
  ) {}

  private usersCol() {
    return this.db.collection('users');
  }

  async validateUser(email: string, password: string) {
    const snap = await this.usersCol().where('email', '==', email).limit(1).get();
    if (snap.empty) throw new UnauthorizedException('Invalid credentials');
    const doc = snap.docs[0];
    const user = doc.data() as any;
    const ok = await argon2.verify(user.password, password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    await this.usersCol().doc(user.id).update({ last_login: admin.firestore.Timestamp.now() });
    return { id: user.id, name: user.name, email: user.email, user_type: user.user_type } as const;
  }

  signToken(user: { id: string; email: string; name: string; user_type: 'staff' | 'customer' }) {
    const secret = this.config.get<string>('JWT_SECRET');
    if (!secret) throw new Error('JWT secret not configured');
    const expiresIn = this.config.get<string>('JWT_EXPIRY') || '24h';
    const token = jwt.sign(user as any, secret as jwt.Secret, { expiresIn } as jwt.SignOptions);
    return token;
  }
}


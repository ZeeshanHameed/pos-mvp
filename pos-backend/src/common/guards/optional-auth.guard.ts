import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from './auth.guard';

/**
 * Optional authentication guard that validates JWT token if present,
 * but allows the request to proceed even if no token is provided.
 * Sets request.user if a valid token is found.
 */
@Injectable()
export class OptionalAuthGuard implements CanActivate {
  private readonly logger = new Logger(OptionalAuthGuard.name);

  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const auth = request.headers['authorization'] || request.headers['Authorization'];

    this.logger.debug(`Authorization header: ${auth ? auth.substring(0, 20) + '...' : 'null'}`);

    // If no auth header, allow request to proceed without user
    if (!auth || typeof auth !== 'string' || !auth.startsWith('Bearer ')) {
      this.logger.debug('No authorization header found, proceeding without user');
      return true;
    }

    let token = auth.slice('Bearer '.length);

    // Handle double "Bearer" case (common client error)
    if (token.startsWith('Bearer ')) {
      this.logger.warn('Double "Bearer" detected in token, removing extra prefix');
      token = token.slice('Bearer '.length);
    }

    this.logger.debug(`Token extracted (first 20 chars): ${token.substring(0, 20)}...`);

    const secret = this.config.get<string>('JWT_SECRET');
    this.logger.debug(`JWT_SECRET configured: ${secret ? 'YES' : 'NO'}`);

    if (!secret) {
      // If JWT secret is not configured, proceed without user
      this.logger.warn('JWT_SECRET not configured, proceeding without user');
      return true;
    }

    try {
      this.logger.debug('Attempting to verify token...');
      const decoded = jwt.verify(token, secret as jwt.Secret);
      this.logger.debug(`Token decoded successfully: ${JSON.stringify(decoded)}`);

      if (decoded && typeof decoded === 'object' && 'user_type' in decoded) {
        request.user = decoded as JwtPayload;
        this.logger.debug(`User authenticated: ${(decoded as JwtPayload).email} (${(decoded as JwtPayload).user_type})`);
      } else {
        this.logger.warn(`Token decoded but missing user_type field. Decoded: ${JSON.stringify(decoded)}`);
      }
    } catch (error) {
      // Invalid token - just proceed without user (don't throw error)
      this.logger.warn(`Token validation failed: ${error.message}`);
      this.logger.debug(`Full error: ${JSON.stringify(error)}`);
    }

    return true;
  }
}


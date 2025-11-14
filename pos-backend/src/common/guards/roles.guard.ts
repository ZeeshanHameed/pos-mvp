import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class StaffOnlyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user as { user_type?: string } | undefined;
    if (user?.user_type !== 'staff') {
      throw new ForbiddenException('Staff only');
    }
    return true;
  }
}


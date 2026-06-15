import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import type { User } from './user.entity';

@Injectable()
export class SuperadminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const user = context.switchToHttp().getRequest().user as User | undefined;
    if (user?.role !== 'superadmin') {
      throw new ForbiddenException('Se requiere rol superadmin');
    }
    return true;
  }
}

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{ url?: string }>();
    if (request.url?.includes('/documents/') && request.url.includes('/download')) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data: unknown) => {
        if (data && typeof data === 'object' && 'success' in (data as object)) {
          return data;
        }
        if (data && typeof data === 'object' && 'items' in (data as object) && 'meta' in (data as object)) {
          const paginated = data as { items: unknown; meta: unknown };
          return { success: true, data: paginated.items, meta: paginated.meta };
        }
        return { success: true, data };
      }),
    );
  }
}

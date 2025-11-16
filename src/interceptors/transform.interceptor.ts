import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map, Observable } from 'rxjs';
import { IS_SKIP_TRANSFORM_KEY } from 'src/decorators';

export interface Response<T> {
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const isSkipTransform = this.reflector.getAllAndOverride<boolean>(
      IS_SKIP_TRANSFORM_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isSkipTransform) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => ({
        statusCode: context.switchToHttp().getResponse().statusCode,
        message: data?.message ?? 'Success',
        data: data?.data ?? data,
        meta: data?.meta, // for pagination
      })),
    );
  }
}

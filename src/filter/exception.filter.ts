// http-exception.filter.ts
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
// import { ValidationError } from 'class-validator';

// function formatValidationErrors(errors: ValidationError[]) {
//   return errors.map(err => ({
//     field: err.property,
//     constraints: err.constraints,
//     children: err.children?.length ? formatValidationErrors(err.children) : undefined,
//   }));
// }

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();

    const isHttp = exception instanceof HttpException;
    const status = isHttp
      ? (exception as HttpException).getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    // default shape
    const body: any = {
      statusCode: status,
      message: 'Internal server error',
      data: null,
    };

    if (isHttp) {
      const exc = exception as HttpException;
      const excRes = exc.getResponse();

      // handle ValidationPipe (which usually returns an object or array)
      if (typeof excRes === 'object' && excRes !== null) {
        // If the pipe uses our exceptionFactory shape, it may already be proper
        if ((excRes as any).errors || (excRes as any).message) {
          // merge helpful fields but keep consistent top-level keys
          body.message = (excRes as any).message ?? body.message;
          if ((excRes as any).errors) body.errors = (excRes as any).errors;
          if ((excRes as any).data) body.data = (excRes as any).data;
        } else if (Array.isArray(excRes)) {
          // class-validator default returns array of strings sometimes
          body.message = 'Validation failed';
          body.errors = excRes;
        } else {
          // some HttpExceptions return { message: ..., error: ... }
          body.message = (excRes as any).message ?? JSON.stringify(excRes);
        }
      } else if (typeof excRes === 'string') {
        body.message = excRes;
      }
    } else {
      // Non-Http exception (unexpected)
      body.message =
        (exception as any)?.message ?? 'Internal server error (non-http)';
    }

    // If it's specifically a validation error from ValidationPipe default:
    // some configs produce BadRequestException with `.message` as an array
    if (
      (exception as any)?.response?.message &&
      Array.isArray((exception as any).response.message)
    ) {
      body.message = 'Validation failed';
      body.errors = (exception as any).response.message;
    }

    res.status(status).json(body);
  }
}

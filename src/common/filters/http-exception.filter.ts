import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const payload =
      exception instanceof HttpException ? exception.getResponse() : null;

    let message = 'Ichki server xatosi';
    let errors: unknown = undefined;

    if (typeof payload === 'string') {
      message = payload;
    } else if (payload && typeof payload === 'object') {
      const body = payload as { message?: string | string[]; error?: string };
      if (Array.isArray(body.message)) {
        message = body.message[0];
        errors = body.message;
      } else if (body.message) {
        message = body.message;
      } else if (body.error) {
        message = body.error;
      }
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      errors,
    });
  }
}

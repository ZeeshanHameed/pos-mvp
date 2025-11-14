import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ApiResponse } from '../dto/api-response.dto';
import { randomUUID } from 'crypto';

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const correlationId = (request.headers['x-correlation-id'] as string) || randomUUID();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorDetails: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;
      message = (res && res.message) || exception.message || message;

      // Only include error details if it's an object (not a string)
      if (res && typeof res === 'object' && res.error) {
        errorDetails = res.error;
      }
    } else if (exception?.status && exception?.message) {
      status = exception.status;
      message = exception.message;
    } else {
      errorDetails = {
        name: exception?.name,
        message: exception?.message,
        stack: exception?.stack
      };
    }

    // Build response - only include error field if there are actual error details
    const responseBody: any = {
      success: false,
      statusCode: status,
      message,
    };

    if (errorDetails && typeof errorDetails === 'object') {
      responseBody.error = { ...errorDetails, correlationId };
    } else {
      responseBody.correlationId = correlationId;
    }

    response
      .status(status)
      .json(new ApiResponse(responseBody));
  }
}


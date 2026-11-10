import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppException } from './exceptions';
import { logger } from './logger';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    message?: string;
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    [key: string]: unknown;
  };
  timestamp: string;
}

export class ApiResponseHelper {
  public static success<T>(
    data: T,
    statusOrMessage: number | string = 200,
    metaOrStatus?: number | ApiResponse<T>['meta']
  ): NextResponse<ApiResponse<T>> {
    let statusCode = 200;
    let meta: ApiResponse<T>['meta'] | undefined;

    if (typeof statusOrMessage === 'string') {
      meta = { message: statusOrMessage };
      if (typeof metaOrStatus === 'number') {
        statusCode = metaOrStatus;
      } else if (metaOrStatus && typeof metaOrStatus === 'object') {
        meta = { ...meta, ...metaOrStatus };
      }
    } else {
      statusCode = statusOrMessage;
      if (metaOrStatus && typeof metaOrStatus === 'object') {
        meta = metaOrStatus;
      }
    }

    return NextResponse.json(
      {
        success: true,
        data,
        meta,
        timestamp: new Date().toISOString(),
      },
      { status: statusCode }
    );
  }

  public static created<T>(data: T, meta?: ApiResponse<T>['meta']): NextResponse<ApiResponse<T>> {
    return this.success(data, 201, meta);
  }

  public static error(
    messageOrOptions: string | { message: string; code?: string; status?: number; details?: unknown },
    code = 'ERROR',
    status = 400,
    details?: unknown
  ): NextResponse<ApiResponse<never>> {
    let msg = 'An error occurred';
    let errCode = code;
    let statusCode = status;
    let errDetails = details;

    if (typeof messageOrOptions === 'object' && messageOrOptions !== null) {
      msg = messageOrOptions.message || 'An error occurred';
      errCode = messageOrOptions.code || 'ERROR';
      statusCode = messageOrOptions.status || 400;
      errDetails = messageOrOptions.details;
    } else {
      msg = messageOrOptions;
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: errCode,
          message: msg,
          details: errDetails,
        },
        timestamp: new Date().toISOString(),
      },
      { status: statusCode }
    );
  }

  public static badRequest(message = 'Bad Request', details?: unknown): NextResponse<ApiResponse<never>> {
    return this.error(message, 'BAD_REQUEST', 400, details);
  }

  public static notFound(message = 'Not Found'): NextResponse<ApiResponse<never>> {
    return this.error(message, 'NOT_FOUND', 404);
  }

  public static unauthorized(message = 'Unauthorized'): NextResponse<ApiResponse<never>> {
    return this.error(message, 'UNAUTHORIZED', 401);
  }

  public static forbidden(message = 'Forbidden'): NextResponse<ApiResponse<never>> {
    return this.error(message, 'FORBIDDEN', 403);
  }

  public static paginated<T>(
    items: T[],
    page: number,
    limit: number,
    total: number
  ): NextResponse<ApiResponse<T[]>> {
    const totalPages = Math.ceil(total / limit);
    return NextResponse.json({
      success: true,
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      timestamp: new Date().toISOString(),
    });
  }

  public static handle(error: unknown, context?: string): NextResponse<ApiResponse<never>> {
    if (error instanceof ZodError) {
      logger.warn(`Validation Error in ${context || 'API'}:`, { errors: error.flatten() });
      return this.error('Request validation failed', 'VALIDATION_ERROR', 422, error.flatten().fieldErrors);
    }

    if (error instanceof AppException) {
      logger.warn(`AppException [${error.code}] in ${context || 'API'}: ${error.message}`);
      return this.error(error.message, error.code, error.statusCode, error.details);
    }

    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(`Unhandled Exception in ${context || 'API'}`, err);

    return this.error(
      process.env.NODE_ENV === 'production' ? 'An unexpected internal server error occurred' : err.message,
      'INTERNAL_SERVER_ERROR',
      500
    );
  }
}

export const apiResponse = ApiResponseHelper;

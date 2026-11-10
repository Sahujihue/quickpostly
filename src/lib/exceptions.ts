export class AppException extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_SERVER_ERROR', details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestException extends AppException {
  constructor(message = 'Invalid request parameters', details?: unknown) {
    super(message, 400, 'BAD_REQUEST', details);
  }
}

export class UnauthorizedException extends AppException {
  constructor(message = 'Authentication required', details?: unknown) {
    super(message, 401, 'UNAUTHORIZED', details);
  }
}

export class ForbiddenException extends AppException {
  constructor(message = 'You do not have permission to perform this action', details?: unknown) {
    super(message, 403, 'FORBIDDEN', details);
  }
}

export class NotFoundException extends AppException {
  constructor(message = 'Requested resource not found', details?: unknown) {
    super(message, 404, 'NOT_FOUND', details);
  }
}

export class ConflictException extends AppException {
  constructor(message = 'Resource already exists', details?: unknown) {
    super(message, 409, 'CONFLICT', details);
  }
}

export class ValidationException extends AppException {
  constructor(message = 'Validation failed', details?: unknown) {
    super(message, 422, 'UNPROCESSABLE_ENTITY', details);
  }
}

export class RateLimitException extends AppException {
  constructor(message = 'Too many requests, please try again later', details?: unknown) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', details);
  }
}

export class SubscriptionLimitExceededException extends AppException {
  constructor(
    message = 'Subscription plan limit exceeded. Please upgrade your plan to unlock more capacity.',
    details?: {
      metric: string;
      current: number;
      max: number;
      plan: string;
      suggestedPlan?: string;
    }
  ) {
    super(message, 403, 'SUBSCRIPTION_LIMIT_EXCEEDED', details);
  }
}

export class SubscriptionRequiredException extends AppException {
  constructor(message = 'An active subscription or valid trial is required to access this feature.', details?: unknown) {
    super(message, 403, 'SUBSCRIPTION_REQUIRED', details);
  }
}

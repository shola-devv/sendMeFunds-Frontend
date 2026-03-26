export class CustomError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class UnauthenticatedError extends CustomError {
  constructor(message = 'Authentication Invalid') {
    super(message, 401);
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message = 'Unauthorized to access this route') {
    super(message, 403);
  }
}

export class NotFoundError extends CustomError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export class BadRequestError extends CustomError {
  constructor(message = 'Bad Request') {
    super(message, 400);
  }
}
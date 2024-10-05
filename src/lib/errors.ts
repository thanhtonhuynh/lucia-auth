// export class PublicError extends Error {
//   constructor(message: string) {
//     super(message);
//   }
// }

export class GenericError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GenericError';
  }
}

export class RateLimitError extends Error {
  constructor() {
    super('Rate limit exceeded');
    this.name = 'RateLimitError';
  }
}

export class AuthenticationError extends Error {
  constructor() {
    super('Authentication failed');
    this.name = 'AuthenticationError';
  }
}

export class TokenExpiredError extends Error {
  constructor() {
    super('Token has expired');
    this.name = 'TokenExpiredError';
  }
}

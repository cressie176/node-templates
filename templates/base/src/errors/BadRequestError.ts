import { ApplicationError } from './ApplicationError.js';

export class BadRequestError extends ApplicationError {
  constructor({ message, cause }: { message: string; cause?: Error }) {
    super({ message, status: 400, code: 'BAD_REQUEST', cause });
  }
}

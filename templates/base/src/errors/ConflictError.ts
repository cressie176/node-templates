import { ApplicationError } from './ApplicationError.js';

export class ConflictError extends ApplicationError {
  constructor({ message, cause }: { message: string; cause?: Error }) {
    super({ message, status: 409, code: 'CONFLICT', cause });
  }
}

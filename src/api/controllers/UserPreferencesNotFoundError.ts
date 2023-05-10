import { HttpError } from 'routing-controllers';

export class UserPreferencesNotFoundError extends HttpError {
  constructor() {
    super(404, 'User preferences data not found!');
  }
}

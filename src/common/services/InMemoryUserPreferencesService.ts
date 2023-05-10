import { NotificationStatus } from '../../notification-converter/interfaces/NotificationBuffer';
import { UserPreferences } from '../interfaces/UserPreferences';
import { UserPreferencesService } from './UserPreferencesService';

export class InMemoryUserPreferencesService implements UserPreferencesService {
  private userPreferences: Array<UserPreferences> = [];

  public async create(userPreferences: UserPreferences): Promise<UserPreferences> {
    this.userPreferences.push(userPreferences);
    return Promise.resolve(userPreferences);
  }

  public async get(uri: string): Promise<UserPreferences> {
    return Promise.resolve(this.userPreferences.find((item) => (item.uri = uri)));
  }

  public async update(userPreferences: UserPreferences): Promise<UserPreferences> {
    if (this.userPreferences.some((item) => item.uri === userPreferences.uri)) {
      this.userPreferences.splice(
        this.userPreferences.findIndex((up) => up.uri === userPreferences.uri),
        1
      );
      this.userPreferences.push(userPreferences);
    }
    return Promise.resolve(userPreferences);
  }

  public async delete(uri: string): Promise<void> {
    this.userPreferences.splice(
      this.userPreferences.findIndex((item) => item.uri === uri),
      1
    );
  }

  public async getRecipientByEmail(email: string): Promise<Array<UserPreferences>> {
    return Promise.resolve(this.userPreferences);
  }

  public async getAllByStatusGroupByRecipient(status: NotificationStatus): Promise<Array<UserPreferences>> {
    return Promise.resolve(this.userPreferences);
  }
}

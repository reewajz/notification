import { EntityRepository, Repository } from 'typeorm';
import { UserPreferencesModel } from '../../notification-converter/model/UserPreferencesModel';

@EntityRepository(UserPreferencesModel)
export class UserPreferencesRepository extends Repository<UserPreferencesModel> {}

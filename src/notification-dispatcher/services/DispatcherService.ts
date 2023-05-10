/**
 *
 * Email dispatcher
 */
import { UserPreferences } from '../../common/interfaces/UserPreferences';

export abstract class DispatcherService {
    /**
     * Sends email out of notification buffer
     * @param recipients
     */
    abstract dispatch(recipients: Array<UserPreferences>): Promise<void>;
}

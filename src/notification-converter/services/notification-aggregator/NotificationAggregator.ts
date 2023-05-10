/**
 *
 * Aggregates notification
 */
export abstract class NotificationAggregator {
    /**
     * Aggregate notification buffer
     */
    abstract aggregate(): Promise<void>;
}

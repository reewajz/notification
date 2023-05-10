export interface BounceRecord {

    // The bounced email address
    bounce_email: string;

    // The bounced domain, extracted from email
    bounce_domain: string;

    // Actor who caused the bounce
    bounce_actor: string;

    // Bounce timestamp
    bounce_timestamp: number;
}

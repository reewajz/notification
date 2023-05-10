import { IsString } from 'class-validator';

export class BounceEventsMessage {

    @IsString()
    public Type: string;

    @IsString()
    public MessageId: string;

    @IsString()
    public TopicArn: string;

    @IsString()
    public Message: string;

    @IsString()
    public Timestamp: string;

    @IsString()
    public SignatureVersion: string;

    @IsString()
    public Signature: string;

    @IsString()
    public SigningCertURL: string;

    @IsString()
    public UnsubscribeURL: string;
}

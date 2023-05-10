import { SQS } from 'aws-sdk';

export class SqsService {
    private readonly sqs: SQS;

    constructor() {
        this.sqs = new SQS();
    }

    /**
     * Sends a message to a queue
     * @param queueUrl
     * @param messageBody
     */
    async sendMessage(queueUrl: string, messageBody: string) {
        await this.sqs.sendMessage({ QueueUrl: queueUrl, MessageBody: messageBody }).promise();
    }
}

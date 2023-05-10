import { CompositeKeyWithValue } from '../../interfaces/CompositeKeyWithValue';

export abstract class MailService {
  abstract sendMail(email: string, subject: string, body: string): Promise<boolean>;
  abstract sendTemplateMail(email: string, templateId: string, templateData: CompositeKeyWithValue): Promise<boolean>;
}

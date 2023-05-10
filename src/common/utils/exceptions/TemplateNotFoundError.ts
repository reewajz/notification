export class TemplateNotFoundError extends Error {
  constructor(templateName: string) {
    super(`Notification template ${templateName} not found`);
  }
}

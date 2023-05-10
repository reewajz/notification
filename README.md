# notification-node

source code for notification system

## Intro

This is a holder for all the Node.js based notification services

### Notification Templates

This project uses mjml to convert the mjml templates into email templates.
To support handlebars, a script `mjml-to-handlerbars-template-converter.js` needs to be executed by providing path to
the folder containing mjml files. It generates an HTML HandlerBars template.

```shell
npm install -g mjml@4.13.0
node mjml-to-handlerbars-template-converter.js --path=/terraform/notification-dispatcher/templates
```

HandlerBar templates input:

```json5
{
  messages: [
    {
      bodyText: "John Doe archived your Trend “Government Surveillance and Reduced Privacy”.",
      bodyHeading: "Your trend was archived.",
      ctaButtons: [
        {
          text: "View element",
          action: "https://"
        }
      ]
    }
  ]
}
```
# notification

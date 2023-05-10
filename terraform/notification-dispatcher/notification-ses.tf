provider "aws" {
  region  = "eu-west-1"
  alias   = "eu-west-1"
}

resource "aws_ses_template" "NotificationTemplate" {
  name     = "NotificationTemplate"
  subject  = "{{subject}}"
  # this file is generated in the CI pipeline by the mjml-to-handlerbars-template-converter.js
  html     = file("${path.module}/templates/multi-buffer-email-template-v2.html")
}


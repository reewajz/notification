provider "aws" {
  region  = "eu-west-1"
  alias   = "ireland"
}

# ------------------------------------------------------------------------
# Main Queue
# ------------------------------------------------------------------------

resource "aws_sqs_queue" "bounce_handler" {
  name = "${local.name}-sqs"

  # triple amount of the timeout of lambda
  visibility_timeout_seconds = 90
  message_retention_seconds  = 86400
  max_message_size           = 262144
  delay_seconds              = 0
  receive_wait_time_seconds  = 0
  redrive_policy             = "{\"deadLetterTargetArn\":\"${aws_sqs_queue.bounce_handler_deadletter.arn}\",\"maxReceiveCount\":5}"

  # Enable SSE-SQS encryption
  sqs_managed_sse_enabled = true

  tags = {
    owner = local.owner
    stack = local.stack
  }
}

resource "aws_sqs_queue_policy" "bounce_handler" {
  queue_url = aws_sqs_queue.bounce_handler.id

  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Id": "sqspolicy",
  "Statement": [
    {
      "Sid": "AllowSNS",
      "Effect": "Allow",
      "Principal": {
        "Service" : "sns.amazonaws.com"
      },
      "Action": "sqs:SendMessage",
      "Resource": "${aws_sqs_queue.bounce_handler.arn}",
      "Condition": {
        "ArnEquals": {
          "aws:SourceArn": [
            "${data.terraform_remote_state.account.outputs.ses_arn_eu}"
            ]
        }
      }
    },
    {
      "Sid": "AllowLambdaExecution",
      "Effect": "Allow",
      "Principal": {
        "AWS": "${module.bounce_handler_lambda.role_arn}"
      },
      "Action": [
        "sqs:ReceiveMessage",
        "sqs:GetQueueAttributes",
        "sqs:DeleteMessage",
        "sqs:ChangeMessageVisibility"
      ],
      "Resource": "${aws_sqs_queue.bounce_handler.arn}"
    }
  ]
}
POLICY
}

data "aws_iam_policy_document" "bounce_handler_sqs_policy" {

  statement {
    effect = "Allow"

    resources = [
      aws_sqs_queue.bounce_handler.arn
    ]

    actions = [
      "sqs:ChangeMessageVisibility",
      "sqs:DeleteMessage",
      "sqs:GetQueueAttributes",
      "sqs:ReceiveMessage",
    ]
  }
}

resource "aws_iam_policy" "bounce_handler_sqs_policy_attachment" {
  name   = "${local.name}-sqs-message-recieve-policy"
  policy = data.aws_iam_policy_document.bounce_handler_sqs_policy.json
}

resource "aws_sns_topic_subscription" "bounce_handler_sqs_subscribe_eu" {
  topic_arn = data.terraform_remote_state.account.outputs.ses_arn_eu
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.bounce_handler.arn
}

# ------------------------------------------------------------------------
# Dead-Letter Queue
# ------------------------------------------------------------------------

resource "aws_sqs_queue" "bounce_handler_deadletter" {
  name = "${local.name}-sqs-deadletter"

  # triple amount of the timeout of lambda
  visibility_timeout_seconds = 90
  message_retention_seconds  = 345600
  max_message_size           = 262144
  delay_seconds              = 0
  receive_wait_time_seconds  = 0

  # Enable SSE-SQS encryption
  sqs_managed_sse_enabled = true

  tags = {
    owner = local.owner
    stack = local.stack
  }
}


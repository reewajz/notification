resource "aws_sqs_queue" "notification_aggregator_queue" {
  name                       = local.name
  visibility_timeout_seconds = 2700
  message_retention_seconds  = 86400
  max_message_size           = 262144
  delay_seconds              = 0
  receive_wait_time_seconds  = 0
  redrive_policy             = "{\"deadLetterTargetArn\":\"${aws_sqs_queue.dead_letter_queue.arn}\",\"maxReceiveCount\":5}"
  sqs_managed_sse_enabled    = true

  tags = {
    owner = local.owner
    stack = local.stack
  }
}

# dead-letter queue
resource "aws_sqs_queue" "dead_letter_queue" {
  name                       = "${local.name}-deadletter"
  visibility_timeout_seconds = 90
  message_retention_seconds  = 604800
  max_message_size           = 262144
  delay_seconds              = 0
  receive_wait_time_seconds  = 0
  sqs_managed_sse_enabled    = true

  tags = {
    owner = local.owner
    stack = local.stack
  }
}

# policy to allow lambda to send messages to queue
data "aws_iam_policy_document" "send_queue_messages" {
  statement {
    effect = "Allow"
    resources = [
      aws_sqs_queue.notification_aggregator_queue.arn,
    ]
    actions = [
      "sqs:SendMessage",
    ]
  }
}

resource "aws_iam_policy" "send_queue_messages_policy" {
  name   = "${local.name}-send-queue-messages"
  policy = data.aws_iam_policy_document.send_queue_messages.json
}



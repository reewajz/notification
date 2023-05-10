module "notification_dispatcher_lambda" {
  source              = "s3::/itonics-tf-modules/4.0.681/lambda_default.zip"
  runtime             = "nodejs16.x"
  name                = local.name
  owner               = local.owner
  stack               = local.stack
  datadog_lambda_name = data.terraform_remote_state.account.outputs.datadog_lambda_name
  datadog_lambda_arn  = data.terraform_remote_state.account.outputs.datadog_lambda_arn


  memory_size = 256
  timeout     = 30

  subnet_ids = data.terraform_remote_state.account.outputs.global_subnet_ids

  environment_variables = {
    SES_REGION            = "eu-central-1"
    SES_DOMAIN            = data.terraform_remote_state.account.outputs.frontend_domain
    CORE_DB_CLIENT_SECRET = "core_db_client",
  }

  security_group_ids = [
    data.terraform_remote_state.account.outputs.core_db_client_security_group_id,
    data.terraform_remote_state.account.outputs.aws_services_client_security_group_id
  ]
}

resource "aws_iam_role_policy_attachment" "notification_send_email_policy_attachment" {
  role       = module.notification_dispatcher_lambda.role_name
  policy_arn = data.terraform_remote_state.account.outputs.lambda_to_ses_send_email_policy
}


# policy to allow lambda to process messages from queue
data "aws_iam_policy_document" "sqs_process_queue_messages" {
  statement {
    effect = "Allow"
    resources = [
      var.queue_arn,
    ]

    actions = [
      "sqs:ChangeMessageVisibility",
      "sqs:DeleteMessage",
      "sqs:GetQueueAttributes",
      "sqs:ReceiveMessage",
    ]
  }
}

resource "aws_iam_policy" "process_queue_messages_policy" {
  name   = "${local.name}-process-queue-messages"
  policy = data.aws_iam_policy_document.sqs_process_queue_messages.json
}

# For processing message from SQS
resource "aws_iam_role_policy_attachment" "notification_dispatcher_lambda_process_queue_messages" {
  role       = module.notification_dispatcher_lambda.role_name
  policy_arn = aws_iam_policy.process_queue_messages_policy.arn
}


# For triggering lambda from SQS
resource "aws_lambda_event_source_mapping" "notification_dispatcher_event_mapping" {
  event_source_arn = var.queue_arn
  function_name    = module.notification_dispatcher_lambda.name
  batch_size       = 4
}

# dynamo access
resource "aws_iam_role_policy_attachment" "dynamo_notification_disable_registry_dynamo_access" {
  role       = module.notification_dispatcher_lambda.role_name
  policy_arn = aws_iam_policy.dynamo_notification_disable_registry_policy.arn
}

# policy attachment
resource "aws_iam_role_policy_attachment" "core_db_client" {
  role       = module.notification_dispatcher_lambda.role_name
  policy_arn = data.terraform_remote_state.account.outputs.core_db_client_policy_arn
}

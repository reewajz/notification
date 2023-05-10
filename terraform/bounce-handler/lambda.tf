module "bounce_handler_lambda" {
  source              = "s3::/itonics-tf-modules/4.0.681/lambda_default.zip"
  runtime             = "nodejs16.x"
  name                = local.name
  owner               = local.owner
  stack               = local.stack
  datadog_lambda_name = data.terraform_remote_state.account.outputs.datadog_lambda_name
  datadog_lambda_arn  = data.terraform_remote_state.account.outputs.datadog_lambda_arn

  memory_size = 256
  timeout     = 30

  environment_variables = {
    LOG_LEVEL = "INFO"

    # Receiving from SQS Queues
    SQS_BOUNCE_HANDLER_NAME = aws_sqs_queue.bounce_handler.name

    SES_REGION = "eu-central-1"
  }

  security_group_ids = [
    data.terraform_remote_state.account.outputs.core_db_client_security_group_id,
    data.terraform_remote_state.account.outputs.aws_services_client_security_group_id
  ]
}

resource "aws_iam_role_policy" "ses_log_kms_policy" {
  name = "ses_log_kms_policy"
  role = module.bounce_handler_lambda.role_name
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "kms:GenerateDataKey",
          "kms:Decrypt"
        ]
        Effect   = "Allow"
        Resource = "*"
      },
    ]
  })
}

resource "aws_iam_role_policy" "ses_supression_list_policy" {
  name = "ses_supression_list_policy"
  role = module.bounce_handler_lambda.role_name
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "ses:PutSuppressedDestination"
        ]
        Effect   = "Allow"
        Resource = "*"
      },
    ]
  })
}

resource "aws_iam_role_policy_attachment" "bounce_handler_receive_message" {
  role       = module.bounce_handler_lambda.role_name
  policy_arn = aws_iam_policy.bounce_handler_sqs_policy_attachment.arn
}

resource "aws_lambda_event_source_mapping" "bounce_handler_events_source" {
  event_source_arn = aws_sqs_queue.bounce_handler.arn
  function_name    = module.bounce_handler_lambda.arn
}

resource "aws_iam_role_policy_attachment" "lambda_bounce_list_table_read_write_permissions" {
  role       = module.bounce_handler_lambda.role_name
  policy_arn = aws_iam_policy.dynamo_bounce_list_read_policy.arn
}

resource "aws_iam_role_policy_attachment" "core_db_client" {
  policy_arn = data.terraform_remote_state.account.outputs.core_db_client_policy_arn
  role       = module.bounce_handler_lambda.role_name
}

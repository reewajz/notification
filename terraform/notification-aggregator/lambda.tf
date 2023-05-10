module "notification_aggregator_lambda" {
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
    CORE_DB_CLIENT_SECRET  = "core_db_client",
    NOTIFICATION_QUEUE_URL = aws_sqs_queue.notification_aggregator_queue.id
  }

  subnet_ids = data.terraform_remote_state.account.outputs.global_subnet_ids
  security_group_ids = [
    data.terraform_remote_state.account.outputs.core_db_client_security_group_id,
    data.terraform_remote_state.account.outputs.aws_services_client_security_group_id
  ]
}


# attach policy to send message to SQS
resource "aws_iam_role_policy_attachment" "notification_aggregator_lambda_send_messages_to_queue" {
  role       = module.notification_aggregator_lambda.role_name
  policy_arn = aws_iam_policy.send_queue_messages_policy.arn
}


# policy attachment
resource "aws_iam_role_policy_attachment" "core_db_client" {
  role       = module.notification_aggregator_lambda.role_name
  policy_arn = data.terraform_remote_state.account.outputs.core_db_client_policy_arn
}

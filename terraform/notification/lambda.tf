module "notification_api_lambda" {
  source              = "s3::/itonics-tf-modules/2.0.594/lambda_default.zip"
  runtime             = "nodejs16.x"
  name                = local.name
  owner               = local.owner
  stack               = local.stack
  memory_size         = 256
  timeout             = 30
  datadog_lambda_name = data.terraform_remote_state.account.outputs.datadog_lambda_name
  datadog_lambda_arn  = data.terraform_remote_state.account.outputs.datadog_lambda_arn

  environment_variables = {
    CORE_DB_CLIENT_SECRET = "core_db_client"
  }

  subnet_ids = data.terraform_remote_state.account.outputs.global_subnet_ids
  security_group_ids = [
    data.terraform_remote_state.account.outputs.core_db_client_security_group_id,
    data.terraform_remote_state.account.outputs.aws_services_client_security_group_id
  ]
}

# policy attachment
resource "aws_iam_role_policy_attachment" "core_db_client" {
  role       = module.notification_api_lambda.role_name
  policy_arn = data.terraform_remote_state.account.outputs.core_db_client_policy_arn
}

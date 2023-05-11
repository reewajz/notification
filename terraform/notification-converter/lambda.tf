module "notification_converter_lambda" {
  source              = "s3::/itonics-tf-modules/4.0.681/lambda_default.zip"
  runtime             = "nodejs16.x"
  name                = local.name
  owner               = local.owner
  stack               = local.stack
  datadog_lambda_name = data.terraform_remote_state.account.outputs.datadog_lambda_name
  datadog_lambda_arn  = data.terraform_remote_state.account.outputs.datadog_lambda_arn

  environment_variables = {
    CORE_DB_CLIENT_SECRET = "test",
    AUDIT_BUCKET_NAME     = "audit-v2-${terraform.workspace}"
  }

  memory_size = 256
  timeout     = 30

  subnet_ids = data.terraform_remote_state.account.outputs.global_subnet_ids
  security_group_ids = [
    data.terraform_remote_state.account.outputs.core_db_client_security_group_id,
    data.terraform_remote_state.account.outputs.aws_services_client_security_group_id
  ]
}



resource "aws_cloudwatch_event_rule" "notification_converter_lambda_event_for_cloudwatch" {
  name           = "enriched-event-for-${local.name}"
  description    = "notification converter lambda cloudwatch event rule"
  event_bus_name = var.audit_event_bus_name
  event_pattern  = jsonencode({ "source" : ["audit"], "detail-type" : ["audit_enriched_event"] })
}

resource "aws_cloudwatch_event_target" "notification_converter_lambda_event_subscription" {
  target_id      = "lambda_event_${local.name}"
  rule           = aws_cloudwatch_event_rule.notification_converter_lambda_event_for_cloudwatch.name
  event_bus_name = var.audit_event_bus_name
  arn            = module.notification_converter_lambda.arn
}

resource "aws_lambda_permission" "allow_cloudwatch_to_invoke_lambda" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = module.notification_converter_lambda.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.notification_converter_lambda_event_for_cloudwatch.arn
}

# audit buckets access
resource "aws_iam_role_policy_attachment" "audit_s3_buckets_access" {
  role       = module.notification_converter_lambda.role_name
  policy_arn = var.audit_bucket_access_policy
}


# policy attachment
resource "aws_iam_role_policy_attachment" "core_db_client" {
  role       = module.notification_converter_lambda.role_name
  policy_arn = data.terraform_remote_state.account.outputs.core_db_client_policy_arn
}

# dynamo access
resource "aws_iam_role_policy_attachment" "notification_event_config_dynamo_access" {
  role       = module.notification_converter_lambda.role_name
  policy_arn = aws_iam_policy.dynamo_notification_event_config_policy.arn
}

//resource "aws_iam_role_policy_attachment" "use_features_client" {
//  role       = module.notification_converter_lambda.role_name
//  policy_arn = data.terraform_remote_state.features.features_client_policy_arn
//}

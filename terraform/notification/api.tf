module "notification_api_lambda_api_gateway" {
  source = "s3::/itonics-tf-modules/2.0.594/lambda_api_gateway.zip"

  name                = local.name
  lambda_name         = module.notification_api_lambda.function_name
  lambda_arn          = module.notification_api_lambda.arn
  lambda_invoke_arn   = module.notification_api_lambda.invoke_arn
  lambda_role_name    = module.notification_api_lambda.role_name
  authorization       = "CUSTOM"
  authorizer_id       = module.notification_api_lambda_api_gateway_authorizer.id
  datadog_lambda_name = data.terraform_remote_state.account.outputs.datadog_lambda_name
  datadog_lambda_arn  = data.terraform_remote_state.account.outputs.datadog_lambda_arn
  owner               = local.owner
  stack               = local.stack
  enable_cache        = true
}

# reference custom authorizer lambda from auth-node repo
data "terraform_remote_state" "auth" {
  backend = "s3"
  config = {
    bucket = "itonics-tf-states"
    key    = "env:/${terraform.workspace}/auth-node.tfstate"
    region = "us-east-1"
  }
}

module "notification_api_lambda_api_gateway_authorizer" {
  source = "s3::/itonics-tf-modules/2.0.594/lambda_api_gateway_authorizer.zip"

  name                         = local.name
  rest_api_id                  = module.notification_api_lambda_api_gateway.id
  lambda_authorizer_arn        = data.terraform_remote_state.auth.outputs.authorizer_lambda_arn
  lambda_authorizer_invoke_arn = data.terraform_remote_state.auth.outputs.authorizer_lambda_invoke_arn
}

module "notification_api_gateway_rest_lambda" {
  source = "s3::/itonics-tf-modules/3.0.621/lambda_api_gateway_rest.zip"

  name           = local.api_prefix
  api_gateway_id = module.notification_api_lambda_api_gateway.id
}


terraform {
  backend "s3" {
    bucket = ""
    key    = "notification-node.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region  = "eu-central-1"
}

provider "datadog" {
  api_key = var.DATADOG_API_KEY
  app_key = var.DATADOG_APP_KEY
}

provider "template" {
}

data "terraform_remote_state" "account" {
  backend = "s3"

  config = {
    bucket = "it-tf-states"
    key    = "env:/${terraform.workspace}/account.tfstate"
    region = "us-east-1"
  }
}
data "terraform_remote_state" "audit-node" {
  backend = "s3"

  config = {
    bucket = "it-tf-states"
    key    = "env:/${terraform.workspace}/audit-node.tfstate"
    region = "us-east-1"
  }
}

locals {
  owner = "reewaj.shrestha@itonics.de"
  stack = "notification"
  name  = "Notification"

  account_id = data.terraform_remote_state.account.outputs.account_id
}

module "notification" {
  source                      = "./terraform/notification"
  owner                       = local.owner
  stack                       = local.stack
}

module "notification-converter" {
  source                     = "./terraform/notification-converter"
  owner                      = local.owner
  stack                      = local.stack
  audit_event_bus_name       = data.terraform_remote_state.audit-node.outputs.audit_log_event_bus_name
  audit_bucket_access_policy = data.terraform_remote_state.audit-node.outputs.audit_log_bucket_all_permissions_policy_arn
}

module "notification-aggregator" {
  source                     = "./terraform/notification-aggregator"
  owner                      = local.owner
  stack                      = local.stack
}

module "notification-dispatcher" {
  source                      = "./terraform/notification-dispatcher"
  owner                       = local.owner
  stack                       = local.stack
  account_id                  = local.account_id
  queue_arn                   = module.notification-aggregator.notification_aggregator_queue_arn
}

module "bounce-handler" {
  source     = "./terraform/bounce-handler"
  owner      = local.owner
  stack      = local.stack
  account_id = local.account_id
}

locals {
  name        = "bounce-handler"
  owner       = var.owner
  stack       = var.stack
  account_id  = var.account_id
}

data "terraform_remote_state" "account" {
  backend = "s3"

  config = {
    bucket = "itonics-tf-states"
    key    = "env:/${terraform.workspace}/account.tfstate"
    region = "us-east-1"
  }
}

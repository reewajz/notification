locals {
  name  = "notification-dispatcher"
  owner = var.owner
  stack = var.stack
}

data "terraform_remote_state" "account" {
  backend = "s3"

  config = {
    bucket = "itonics-tf-states"
    key    = "env:/${terraform.workspace}/account.tfstate"
    region = "us-east-1"
  }
}

variable "account_id" {
}

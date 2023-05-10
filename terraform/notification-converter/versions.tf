terraform {
  required_version = ">= 1.2.8"
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "~> 4.28.0"
    }
    archive = {
      source = "hashicorp/archive"
    }
  }
}

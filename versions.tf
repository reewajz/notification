terraform {
  required_version = ">= 1.2.8"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.28.0"
    }
    template = {
      source = "hashicorp/template"
    }
    archive = {
      source = "hashicorp/archive"
    }
    datadog = {
      source  = "Datadog/datadog"
      version = "=3.15.1"
    }
  }
}

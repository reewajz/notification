resource "aws_dynamodb_table" "notification_disable_registry" {
  name         = "NotificationDisableRegistry"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "identifier"

  attribute {
    name = "identifier"
    type = "S"
  }

  ttl {
    attribute_name = ""
    enabled        = false
  }

  tags = {
    owner = local.owner
    stack = local.stack
  }

  point_in_time_recovery {
    enabled = true
  }
}


data "aws_iam_policy_document" "dynamo_notification_disable_registry_full_permissions" {
  statement {
    sid = ""

    actions = [
      "dynamodb:BatchGet*",
      "dynamodb:Get*",
      "dynamodb:Query",
      "dynamodb:Scan",
      "dynamodb:BatchWrite*",
      "dynamodb:Delete*",
      "dynamodb:Update*",
      "dynamodb:PutItem",
    ]

    resources = [
      aws_dynamodb_table.notification_disable_registry.arn
    ]
  }
}

resource "aws_iam_policy" "dynamo_notification_disable_registry_policy" {
  name   = "dynamo_notification_disable_registry_policy"
  policy = data.aws_iam_policy_document.dynamo_notification_disable_registry_full_permissions.json
}


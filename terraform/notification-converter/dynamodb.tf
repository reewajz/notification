resource "aws_dynamodb_table" "notification_event_config" {
  name         = "NotificationEventConfig"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "uri"
  range_key    = "source"

  attribute {
    name = "uri"
    type = "S"
  }

  attribute {
    name = "source"
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


data "aws_iam_policy_document" "dynamo_notification_event_config_full_permissions" {
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
      aws_dynamodb_table.notification_event_config.arn
    ]
  }
}

resource "aws_iam_policy" "dynamo_notification_event_config_policy" {
  name   = "dynamo_notification_event_config_policy"
  policy = data.aws_iam_policy_document.dynamo_notification_event_config_full_permissions.json
}


resource "aws_dynamodb_table" "bounce_list" {
  name         = "BounceList"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "bounce_timestamp"

  attribute {
    name = "bounce_timestamp"
    type = "N"
  }

  ttl {
    attribute_name = ""
    enabled        = false
  }

}

data "aws_iam_policy_document" "dynamo_bounce_list_read_access" {
  statement {
    sid = ""

    actions = [
      "dynamodb:BatchGet*",
      "dynamodb:DescribeStream",
      "dynamodb:DescribeTable",
      "dynamodb:Get*",
      "dynamodb:Query",
      "dynamodb:Scan",
      "dynamodb:PutItem",
      "dynamodb:UpdateItem",
      "dynamodb:BatchWriteItem",
    ]

    resources = [
      aws_dynamodb_table.bounce_list.arn,
    ]
  }
}

resource "aws_iam_policy" "dynamo_bounce_list_read_policy" {
  name   = "bounce_list_dynamo_table_read_policy"
  policy = data.aws_iam_policy_document.dynamo_bounce_list_read_access.json
}

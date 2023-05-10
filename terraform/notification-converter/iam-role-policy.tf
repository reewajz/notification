locals {
  team_lead_notification_per_status = terraform.workspace == "production" ? 1 : 1
}

data "aws_iam_role" "team_lead" {
  count = local.team_lead_notification_per_status
  name  = "${terraform.workspace}-team-lead"
}

resource "aws_iam_policy" "team_lead_notification_access_policy" {
  count       = local.team_lead_notification_per_status
  name        = "team_lead_notification_access"
  description = "Allows team leads to read cloudwatch logs, run lambdas, post messages to SQS and SNS etc."
  policy      = file("${path.module}/team_lead_policy.json")
}

resource "aws_iam_role_policy_attachment" "team_lead_feature_access_policy" {
  count      = local.team_lead_notification_per_status
  role       = data.aws_iam_role.team_lead[count.index].name
  policy_arn = aws_iam_policy.team_lead_notification_access_policy[count.index].arn
}

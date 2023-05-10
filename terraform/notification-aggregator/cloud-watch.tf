resource "aws_cloudwatch_event_rule" "notification_aggregator_lambda_scheduled_event" {
  name        = "invoke-${local.name}-lambda-handler-function"
  description = "Invoke ${local.name} lambda function periodically"

  schedule_expression = "rate(5 minutes)"

  // triggered every day at 1 am
  is_enabled = true
}

resource "aws_cloudwatch_event_target" "notification_aggregator_lambda_scheduled_event_target" {
  rule      = aws_cloudwatch_event_rule.notification_aggregator_lambda_scheduled_event.name
  target_id = "lambda_event_${local.name}"
  arn       = module.notification_aggregator_lambda.arn
}

resource "aws_lambda_permission" "allow_cloudwatch" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = module.notification_aggregator_lambda.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.notification_aggregator_lambda_scheduled_event.arn
}


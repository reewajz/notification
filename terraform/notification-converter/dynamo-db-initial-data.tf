resource "aws_dynamodb_table_item" "element_rejected_dynamo_item" {
  table_name = aws_dynamodb_table.notification_event_config.name
  hash_key   = aws_dynamodb_table.notification_event_config.hash_key
  range_key  = aws_dynamodb_table.notification_event_config.range_key

  item = <<ITEM
{
  "uri": {
    "S": "ELEMENT_REJECTED"
  },
  "source": {
    "S": "ELEMENT"
  },
  "actionUrl": {
    "S": "https://{{tenantSlug}}.{{domain}}.io/explorer/{{sourceUri}}/detail/{{objectUri}}"
  },
  "audience": {
    "L": [
      {
        "S": "OBJECT_OWNER"
      }
    ]
  },
  "object": {
    "S": "contexts.newState.itonics@elements-node/contracts/elements/Element.createdByUri"
  },
  "predicate": {
    "S": "subAction"
  },
  "subject": {
    "S": "userUri"
  },
  "variables": {
    "M": {
      "title": {
        "S": "objectName"
      },
      "type": {
        "S": "translations.itonics@elements-node/contracts/types/ElementType"
      }
    }
  }
}
ITEM
}

resource "aws_dynamodb_table_item" "element_phase_change_dynamo_item" {
  table_name = aws_dynamodb_table.notification_event_config.name
  hash_key   = aws_dynamodb_table.notification_event_config.hash_key
  range_key  = aws_dynamodb_table.notification_event_config.range_key

  item = <<ITEM
{
  "uri": {
    "S": "ELEMENT_PHASE_CHANGE"
  },
  "source": {
    "S": "ELEMENT"
  },
  "actionUrl": {
    "S": "https://{{tenantSlug}}.{{domain}}.io/explorer/{{sourceUri}}/detail/{{objectUri}}"
  },
  "audience": {
    "L": [
      {
        "S": "OBJECT_OWNER"
      }
    ]
  },
  "object": {
    "S": "contexts.newState.itonics@elements-node/contracts/elements/Element.createdByUri"
  },
  "predicate": {
    "S": "subAction"
  },
  "subject": {
    "S": "userUri"
  },
  "variables": {
    "M": {
      "title": {
        "S": "objectName"
      },
      "type": {
        "S": "translations.itonics@elements-node/contracts/types/ElementType"
      }
    }
  }
}
ITEM
}

resource "aws_dynamodb_table_item" "element_child_created_dynamo_item" {
  table_name = aws_dynamodb_table.notification_event_config.name
  hash_key   = aws_dynamodb_table.notification_event_config.hash_key
  range_key  = aws_dynamodb_table.notification_event_config.range_key

  item = <<ITEM
{
  "uri": {
    "S": "ELEMENT_CHILD_CREATED"
  },
  "source": {
    "S": "ELEMENT"
  },
  "actionUrl": {
    "S": "https://{{tenantSlug}}.{{domain}}.io/explorer/{{sourceUri}}/detail/{{objectUri}}"
  },
  "audience": {
    "L": [
      {
        "S": "OBJECT_OWNER"
      }
    ]
  },
  "elementUriPath": {
    "S": "objectUri"
  },
  "object": {
    "S": "userUri"
  },
  "predicate": {
    "S": "subAction"
  },
  "subject": {
    "S": "userUri"
  },
  "variables": {
    "M": {
      "title": {
        "S": "objectName"
      },
      "type": {
        "S": "translations.itonics@elements-node/contracts/types/ElementType"
      }
    }
  }
}
ITEM
}

resource "aws_dynamodb_table_item" "element_revived_dynamo_item" {
  table_name = aws_dynamodb_table.notification_event_config.name
  hash_key   = aws_dynamodb_table.notification_event_config.hash_key
  range_key  = aws_dynamodb_table.notification_event_config.range_key

  item = <<ITEM
{
  "uri": {
    "S": "ELEMENT_REVIVED"
  },
  "source": {
    "S": "ELEMENT"
  },
  "actionUrl": {
    "S": "https://{{tenantSlug}}.{{domain}}.io/explorer/{{sourceUri}}/detail/{{objectUri}}"
  },
  "audience": {
    "L": [
      {
        "S": "OBJECT_OWNER"
      }
    ]
  },
  "object": {
    "S": "contexts.newState.itonics@elements-node/contracts/elements/Element.createdByUri"
  },
  "predicate": {
    "S": "subAction"
  },
  "subject": {
    "S": "userUri"
  },
  "variables": {
    "M": {
      "title": {
        "S": "objectName"
      },
      "type": {
        "S": "translations.itonics@elements-node/contracts/types/ElementType"
      }
    }
  }
}
ITEM
}

resource "aws_dynamodb_table_item" "element_archived_dynamo_item" {
  table_name = aws_dynamodb_table.notification_event_config.name
  hash_key   = aws_dynamodb_table.notification_event_config.hash_key
  range_key  = aws_dynamodb_table.notification_event_config.range_key

  item = <<ITEM
{
  "uri": {
    "S": "ELEMENT_ARCHIVED"
  },
  "source": {
    "S": "ELEMENT"
  },
  "actionUrl": {
    "S": "https://{{tenantSlug}}.{{domain}}.io/explorer/{{sourceUri}}/detail/{{objectUri}}"
  },
  "audience": {
    "L": [
      {
        "S": "OBJECT_OWNER"
      }
    ]
  },
  "object": {
    "S": "contexts.newState.itonics@elements-node/contracts/elements/Element.createdByUri"
  },
  "predicate": {
    "S": "subAction"
  },
  "subject": {
    "S": "userUri"
  },
  "variables": {
    "M": {
      "title": {
        "S": "objectName"
      },
      "type": {
        "S": "translations.itonics@elements-node/contracts/types/ElementType"
      }
    }
  }
}
ITEM
}

resource "aws_dynamodb_table_item" "comment_reply_dynamo_item" {
  table_name = aws_dynamodb_table.notification_event_config.name
  hash_key   = aws_dynamodb_table.notification_event_config.hash_key
  range_key  = aws_dynamodb_table.notification_event_config.range_key

  item = <<ITEM
{
  "uri": {
    "S": "COMMENT_REPLY"
  },
  "source": {
    "S": "COMMENT"
  },
  "actionUrl": {
    "S": "https://{{tenantSlug}}.{{domain}}.io/explorer/{{spaceUri}}/detail/{{elementUri}}"
  },
  "audience": {
    "L": [
      {
        "S": "OBJECT_OWNER"
      }
    ]
  },
  "object": {
    "S": "contexts.newState.itonics@files-node/Models/interfaces/Comment.createdBy"
  },
  "predicate": {
    "S": "subAction"
  },
  "subject": {
    "S": "userUri"
  },
  "variables": {
    "M": {
      "content": {
        "S": "contexts.newState.itonics@files-node/Models/interfaces/Comment.content"
      }
    }
  }
}
ITEM
}

resource "aws_dynamodb_table_item" "comment_mention_dynamo_item" {
  table_name = aws_dynamodb_table.notification_event_config.name
  hash_key   = aws_dynamodb_table.notification_event_config.hash_key
  range_key  = aws_dynamodb_table.notification_event_config.range_key

  item = <<ITEM
{
  "uri": {
    "S": "COMMENT_MENTION"
  },
  "source": {
    "S": "COMMENT"
  },
  "actionUrl": {
    "S": "https://{{tenantSlug}}.{{domain}}.io/explorer/{{spaceUri}}/detail/{{elementUri}}"
  },
  "audience": {
    "L": [
      {
        "S": "OBJECT_OWNER"
      }
    ]
  },
  "object": {
    "S": "contexts.newState.itonics@files-node/Models/interfaces/CommentMention.createdBy"
  },
  "predicate": {
    "S": "subAction"
  },
  "subject": {
    "S": "userUri"
  },
  "variables": {
    "M": {
      "content": {
        "S": "contexts.newState.itonics@files-node/Models/interfaces/CommentMention.content"
      }
    }
  }
}
ITEM
}

resource "aws_dynamodb_table_item" "element_published_dynamo_item" {
  table_name = aws_dynamodb_table.notification_event_config.name
  hash_key   = aws_dynamodb_table.notification_event_config.hash_key
  range_key  = aws_dynamodb_table.notification_event_config.range_key

  item = <<ITEM
{
  "uri": {
    "S": "ELEMENT_PUBLISHED"
  },
  "source": {
    "S": "ELEMENT"
  },
  "actionUrl": {
    "S": "https://{{tenantSlug}}.{{domain}}.io/explorer/{{sourceUri}}/detail/{{objectUri}}"
  },
  "audience": {
    "L": [
      {
        "S": "OBJECT_OWNER"
      }
    ]
  },
  "object": {
    "S": "contexts.newState.itonics@elements-node/contracts/elements/Element.createdByUri"
  },
  "predicate": {
    "S": "subAction"
  },
  "subject": {
    "S": "userUri"
  },
  "variables": {
    "M": {
      "title": {
        "S": "objectName"
      },
      "type": {
        "S": "translations.itonics@elements-node/contracts/types/ElementType"
      }
    }
  }
}
ITEM
}

resource "aws_dynamodb_table_item" "element_rated_dynamo_item" {
  table_name = aws_dynamodb_table.notification_event_config.name
  hash_key   = aws_dynamodb_table.notification_event_config.hash_key
  range_key  = aws_dynamodb_table.notification_event_config.range_key

  item = <<ITEM
{
  "uri": {
    "S": "ELEMENT_RATED"
  },
  "source": {
    "S": "ELEMENT"
  },
  "actionUrl": {
    "S": "https://{{tenantSlug}}.{{domain}}.io/explorer/{{sourceUri}}/detail/{{objectUri}}"
  },
  "audience": {
    "L": [
      {
        "S": "ELEMENT_OWNER"
      }
    ]
  },
  "elementUriPath": {
    "S": "objectUri"
  },
  "object": {
    "S": "userUri"
  },
  "predicate": {
    "S": "subAction"
  },
  "subject": {
    "S": "userUri"
  },
  "variables": {
    "M": {
      "title": {
        "S": "objectName"
      },
      "type": {
        "S": "translations.itonics@elements-node/contracts/types/ElementType"
      }
    }
  }
}
ITEM
}

resource "aws_dynamodb_table_item" "comment_created_dynamo_item" {
  table_name = aws_dynamodb_table.notification_event_config.name
  hash_key   = aws_dynamodb_table.notification_event_config.hash_key
  range_key  = aws_dynamodb_table.notification_event_config.range_key

  item = <<ITEM
{
  "uri": {
    "S": "COMMENT_CREATED"
  },
  "source": {
    "S": "COMMENT"
  },
  "actionUrl": {
    "S": "https://{{tenantSlug}}.{{domain}}.io/explorer/{{spaceUri}}/detail/{{sourceUri}}"
  },
  "audience": {
    "L": [
      {
        "S": "OBJECT_OWNER"
      }
    ]
  },
  "object": {
    "S": "contexts.newState.itonics@files-node/Models/interfaces/Comment.createdBy"
  },
  "predicate": {
    "S": "subAction"
  },
  "subject": {
    "S": "userUri"
  },
  "variables": {
    "M": {
      "content": {
        "S": "contexts.newState.itonics@files-node/Models/interfaces/Comment.content"
      },
      "elementTitle": {
        "S": "translations.itonics@elements-node/contracts/elements/Element"
      }
    }
  }
}
ITEM
}


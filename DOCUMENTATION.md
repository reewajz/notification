<a name="top"></a>
# notification-node v1.0.0

This is a holder for all of the Node.js based notification-node services

# Table of contents

- [notification](#markdown-header-notification)
  - [Create user preferences](#markdown-header-Create-user-preferences)
  - [Delete user preferences](#markdown-header-Delete-user-preferences)
  - [Update user preferences](#markdown-header-Update-user-preferences)
- [Notification](#markdown-header-Notification)
  - [Gets user preferences](#markdown-header-Gets-user-preferences)

___


# <a name='notification'></a> notification

## <a name='Create-user-preferences'></a> Create user preferences
[Back to top](#markdown-header-top)

Saves user preferences

```
POST /notification/preferences
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| UserUri | `string` |  |
| userPreferences | `Object` | UserPreference object to be created |

### Success response example

#### Success response example - `Success`

```json
 HTTP/1.1 200 OK
 {
  "uri": "ab54be24-d255-4725-9391-f5794f453c24",
  "notificationChanel": "email",
  "language": "en",
  "excludeList": null,
  "isNotificationEnable": true
}
```

## <a name='Delete-user-preferences'></a> Delete user preferences
[Back to top](#markdown-header-top)

Delete user preferences

```
DELETE /notification/preferences
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| UserUri | `string` |  |

## <a name='Update-user-preferences'></a> Update user preferences
[Back to top](#markdown-header-top)

Updates user preferences

```
PUT /notification/preferences
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| UserUri | `string` |  |
| userPreferences | `Object` | UserPreference object to be updated |

### Success response example

#### Success response example - `Success`

```json
HTTP/1.1 200 OK
{
 "uri": "ab54be24-d255-4725-9391-f5794f453c24",
 "notificationChanel": "email",
 "language": "en",
 "excludeList": null,
 "isNotificationEnable": true
}
```

# <a name='Notification'></a> Notification

## <a name='Gets-user-preferences'></a> Gets user preferences
[Back to top](#markdown-header-top)

```
GET /notification/preferences/:uri
```

### Parameters - `Parameter`

| Name     | Type       | Description                           |
|----------|------------|---------------------------------------|
| uri | `string` | Uri of  the User |

### Success response example

#### Success response example - `Success`

```json
 HTTP/1.1 200 OK
 {
  "uri": "ab54be24-d255-4725-9391-f5794f453c24",
  "notificationChanel": "email",
  "language": "en",
  "excludeList": null,
  "isNotificationEnable": true
}
```


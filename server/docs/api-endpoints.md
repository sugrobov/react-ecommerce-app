# Authentication API Endpoints

## Register

**POST** `/api/auth/register`

Registers a new user.

### Request Body
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "phone": "string (optional)"
}
```

### Response
```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "phone": "string"
  }
}
```

### Errors
- 400: Missing required fields or invalid data
- 409: User already exists
- 500: Internal server error

## Login

**POST** `/api/auth/login`

Authenticates a user and returns access and refresh tokens.

### Request Body
```json
{
  "email": "string",
  "password": "string"
}
```

### Response
```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "phone": "string"
  }
}
```

### Errors
- 400: Missing required fields
- 401: Invalid credentials
- 500: Internal server error

## Refresh Token

**POST** `/api/auth/refresh`

Refreshes an access token using a refresh token.

### Request Body
```json
{
  "refreshToken": "string"
}
```

### Response
```json
{
  "accessToken": "string"
}
```

### Errors
- 400: Missing refresh token
- 403: Invalid refresh token
- 500: Internal server error

## Forgot Password

**POST** `/api/auth/forgot-password`

Sends a password reset email to the user.

### Request Body
```json
{
  "email": "string"
}
```

### Response
```json
{
  "message": "If user exists, password reset instructions have been sent"
}
```

### Errors
- 400: Missing email
- 500: Internal server error

## Reset Password

**POST** `/api/auth/reset-password`

Resets the user's password using a reset token.

### Request Body
```json
{
  "token": "string",
  "newPassword": "string"
}
```

### Response
```json
{
  "message": "Password reset successfully"
}
```

### Errors
- 400: Missing token or newPassword, or invalid token
- 500: Internal server error

## Logout

**POST** `/api/auth/logout`

Invalidates the refresh token.

### Request Body
```json
{
  "refreshToken": "string"
}
```

### Response
```json
{
  "message": "Logged out successfully"
}
```

### Errors
- 500: Internal server error
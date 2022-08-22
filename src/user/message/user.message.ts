export const USER_MESSAGE = {
  //SUCCESS
  success: {
    USER_CREATED: 'User created successfully',
    USER_UPDATED: 'User updated successfully',
    USER_LOGGED_IN: 'User logged in successfully',
    USER_PASSWORD_UPDATED: 'User password updated successfully',
    USER_FOUND: 'User found successfully',
  },
  //ERROR
  error: {
    USER_ALREADY_EXISTS: 'User already exists',
    USER_NOT_FOUND: 'User not found',
    USER_MISSING_CREDENTIALS: 'Missing credentials',
    USER_INVALID_PASSWORD: 'Invalid password',
    USER_INVALID_EMAIL: 'Invalid email',
    USER_SAME_PASSWORD: 'New password is same as old password',
    USER_MISSING_PASSWORD:
      "You don't have a password. Please sign in with your provider",
  },
};

export const USER_MESSAGE = {
  //SUCCESS
  success: {
    USER_CREATED: 'User created successfully',
    USER_UPDATED: 'User updated successfully',
    USER_LOGGED_IN: 'User logged in successfully',
    USER_PASSWORD_UPDATED: 'User password updated successfully',
    USER_FOUND: 'User found successfully',
    USER_EMAIL_VERIFIED: 'User email verified successfully',
    FORGET_PASSWORD_TOKEN_VERIFIED:
      'Forget password token verified successfully',
  },
  //ERROR
  error: {
    USER_ALREADY_EXISTS: 'User already exists',
    USER_NOT_FOUND: 'User does not exist',
    EMAIL_NOT_FOUND: 'Email does not exist',
    USER_MISSING_CREDENTIALS: 'Missing credentials',
    USER_ID_MISSING: 'Missing user id',
    USER_INVALID_ID: 'Invalid user id',
    USER_INVALID_PASSWORD: 'Invalid password',
    USER_INVALID_PASSWORD_SCHEMA:
      'Password must contain at least 1 uppercase, 1 lowercase, 1 number and 1 special character',
    USER_INVALID_EMAIL: 'Invalid email',
    USER_EMAIL_NOT_VERIFIED: 'Email is not verified',
    USER_INVALID_NAME: 'name must contain only letters (a-zA-Z)',
    USER_MISSING_PASSWORD: (...params) =>
      `This account can only be logged into with ${params}. Or by resetting the password with "Forgot Password".`,
    USER_EMAIL_ALREADY_VERIFIED: 'Email is already verified',
    USER_SAME_PASSWORD: 'New password is same as old password',
    USER_EMAIL_MISSING: 'Email is missing',
  },
};

import { AUTH_MESSAGE } from 'src/auth/message/auth.message';
import { SES_MESSAGE } from 'src/aws/ses/message/ses.message';
import { MQTT_MESSAGE } from 'src/mqtt/message/mqtt.message';
import { USER_MESSAGE } from 'src/user/message/user.message';
export const MESSAGE = {
  //AUTH
  auth: AUTH_MESSAGE,
  //USER
  user: USER_MESSAGE,
  //MAIL
  mail: SES_MESSAGE,
  //MQTT
  mqtt: MQTT_MESSAGE,
  //GENERAL
  general: {
    //SUCCESS
    success: {
      HEALTH_CHECK: 'Health check completed successfully',
    },
    //ERROR
    error: {
      NO_DATA_FOUND: 'No data found',
      VALIDATION_FAILED: 'Validation failed',
      CODE_INVALID: 'Invalid code',
      MISSING_CODE: 'Missing code',
      INVALID_AWS_MQTT_IOT_SIGNATURE_TOKEN: 'Invalid signature token',
    },
  },
  //SERVER
  server: {
    //SUCCESS
    success: {},
    //ERROR
    error: {
      INTERNAL_SERVER_ERROR: 'Internal server error',
    },
  },
};

export const messageMap = {
  'jwt expired': MESSAGE.auth.error.AUTH_TOKEN_EXPIRED,
  'No auth token': MESSAGE.auth.error.AUTH_TOKEN_MISSING,
  'invalid signature': MESSAGE.auth.error.AUTH_TOKEN_INVALID,
};

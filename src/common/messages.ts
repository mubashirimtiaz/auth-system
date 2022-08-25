import { AUTH_MESSAGE } from 'src/auth/message/auth.message';
import { MAIL_MESSAGE } from 'src/mail/message/mail.message';
import { USER_MESSAGE } from 'src/user/message/user.message';
export const MESSAGE = {
  //AUTH
  auth: AUTH_MESSAGE,
  //USER
  user: USER_MESSAGE,
  //MAIL
  mail: MAIL_MESSAGE,
  //GENERAL
  general: {
    //SUCCESS
    success: {},
    //ERROR
    error: {
      NO_DATA_FOUND: 'No data found',
      VALIDATION_FAILED: 'Validation failed',
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

import { AUTH_MESSAGE } from 'src/auth/message/auth.message';
export const MESSAGE = {
  //USER
  user: AUTH_MESSAGE,
  //GENERAL
  general: {
    //SUCCESS
    success: {
      EMAIL_SENT: 'Email sent successfully',
    },
    //ERROR
    error: {
      NO_DATA_FOUND: 'No data found',
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

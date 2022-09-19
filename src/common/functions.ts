import { HttpStatus } from '@nestjs/common';
import { ApiErrorResponse } from 'src/common/classes';
import { ApiResponse } from 'src/common/interfaces';
import { MESSAGE } from 'src/common/messages';
import { createPresignedURL } from './sign.aws';
import { createHash } from 'crypto';
import { IotData } from 'aws-sdk';

export const ApiSuccessResponse = <T>(
  success: boolean,
  message: string,
  data?: T,
): ApiResponse<T> => {
  return {
    message,
    success,
    ...(data && { data }),
  };
};

export const getRequiredProperties = (
  payload: { [key: string]: any },
  excludedProp: string[],
) => {
  excludedProp.forEach((prop) => delete payload[prop]);
  return payload;
};

export const throwApiErrorResponse = <T>(error: {
  response?: ApiResponse<T>;
  message?: string;
  status: HttpStatus;
}) => {
  throw new ApiErrorResponse(
    {
      message:
        error?.response?.message ||
        error?.message ||
        MESSAGE.server.error.INTERNAL_SERVER_ERROR,
      success: error?.response?.success || false,
      ...(error?.response?.data && { data: error?.response?.data }),
    },
    error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
  );
};

export const validationPipeException = (errors) => {
  const constraint = errors.reduce(
    (acc, curr) => ({
      ...acc,
      [curr?.property]: Object.values(curr?.constraints),
    }),
    {},
  );

  throwApiErrorResponse({
    response: {
      message: MESSAGE.general.error.VALIDATION_FAILED,
      success: false,
      data: constraint,
    },
    status: HttpStatus.NOT_ACCEPTABLE,
  });
};

export const generateCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const addHrsAheadOfTime = (numOfHours: number): number => {
  const dateCopy = new Date();
  dateCopy.setTime(dateCopy.getTime() + numOfHours * 60 * 60 * 1000);
  return dateCopy.getTime();
};

//mqtt

export const getMqttUrl = (expires: number, mqttPublishIOTUrl: string) => {
  let url = createPresignedURL(
    'GET',
    mqttPublishIOTUrl,
    '/mqtt',
    'iotdevicegateway',

    createHash('sha256').update('', 'utf8').digest('hex'),

    {
      expires: expires,

      key: process.env.MQTT_IOT_ACCESS_KEY,

      secret: process.env.MQTT_IOT_SECRET_ACCESS_KEY,

      protocol: 'wss',

      region: process.env.AWS_REGION,

      signSessionToken: false,
    },
  );

  // splitting url to remove X-Amz-Secuirty-Token so mqtt broker can connect

  url = url.split('&X-Amz-Security-Token')[0];

  return { url };
};

export const publishMqttData = (topic, data, mqttPublishIOTUrl: string) => {
  return new Promise((resolve, reject) => {
    const params = {
      topic,
      payload: data,
      qos: 0,
    };

    const iotData = new IotData({
      endpoint: mqttPublishIOTUrl,
    });

    iotData.publish(params, function (err, publishedData) {
      if (err) {
        console.log(
          `Something went wrong while sending user delete report: ${err}`,
        );
        reject(err);
      }

      resolve(publishedData);
    });
  });
};

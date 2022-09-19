import { Injectable } from '@nestjs/common';
import {
  getMqttUrl,
  publishMqttData,
  throwApiErrorResponse,
} from 'src/common/functions';
import { MqttListenerDTO } from './dto/mqtt.dto';
import * as md5 from 'md5';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MqttService {
  constructor(private readonly configService: ConfigService) {}
  async getPresignedUrl() {
    return getMqttUrl(7200, this.configService.get('MQTT_PUBLISH_IOT_URL'));
  }
  async mqttListener(param: MqttListenerDTO) {
    try {
      if (param.type === 'requestHashCode') {
        const hashCode = md5(
          JSON.stringify({
            userAgent: param.userAgent,
            country: param.country,
          }),
        );
        await publishMqttData(
          param.id,
          {
            type: 'GeneratedHashCode',
            hashCode,
          },
          this.configService.get('MQTT_PUBLISH_IOT_URL'),
        );
      }
    } catch (error) {
      throwApiErrorResponse(error);
    }
  }
}

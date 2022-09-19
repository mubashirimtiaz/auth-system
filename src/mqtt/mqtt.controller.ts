import {
  Body,
  Controller,
  Get,
  Headers,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { throwApiErrorResponse } from 'src/common/functions';
import { MESSAGE } from 'src/common/messages';
import { MqttListenerDTO } from './dto/mqtt.dto';
import { MqttService } from './mqtt.service';

@ApiTags('Mqtt')
@Controller()
export class MqttController {
  constructor(private readonly mqttService: MqttService) {}
  @Get('presigned-url')
  async getPresignedUrl() {
    return this.mqttService.getPresignedUrl();
  }

  @Post('presigned-url/listener')
  async mqttListener(
    @Body() body: MqttListenerDTO,
    @Headers('x-aws-verification-token') token: string,
  ) {
    if (token === process.env.AWS_MQTT_IOT_VERIFICATION_TOKEN) {
      return this.mqttService.mqttListener(body);
    }
    throwApiErrorResponse({
      response: {
        message: MESSAGE.mqtt.error.AWS_MQTT_IOT_VERIFICATION_TOKEN,
        success: false,
      },
      status: HttpStatus.BAD_REQUEST,
    });
  }
}

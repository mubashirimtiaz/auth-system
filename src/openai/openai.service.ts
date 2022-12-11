import { Injectable } from '@nestjs/common';
import { ImgGenDTO } from './dto/openai.dto';
import { OpenAIApi, Configuration } from 'openai';
import {
  ApiSuccessResponse,
  throwApiErrorResponse,
} from 'src/common/functions';
import { ApiResponse } from 'src/common/interfaces';
import { OPENAI_MESSAGE } from './message/openai.message';

const imageSizeMap = {
  small: '256x256',
  medium: '512x512',
  large: '1024x1024',
};

@Injectable()
export class OpenaiService {
  configuration = new Configuration({
    apiKey: process.env.OPENAI_SECRET,
  });

  openai: OpenAIApi = new OpenAIApi(this.configuration);

  async imageGenerator(param: ImgGenDTO): Promise<ApiResponse<unknown>> {
    try {
      const result = await this.openai.createImage({
        prompt: param.prompt,
        n: param.n,
        size: imageSizeMap[param.size],
      });

      return ApiSuccessResponse<unknown>(
        true,
        OPENAI_MESSAGE.success.IMAGE_GENERATED,
        result?.data?.data,
      );
    } catch (error) {
      throwApiErrorResponse(error?.response?.data?.error);
    }
  }
}

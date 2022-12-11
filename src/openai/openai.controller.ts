import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ImgGenDTO } from './dto/openai.dto';
import { OpenaiService } from './openai.service';

@ApiTags('Open AI')
@Controller('openai')
export class OpenaiController {
  constructor(private readonly openaiService: OpenaiService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('image-generator')
  async imageGenerator(@Body() body: ImgGenDTO) {
    return this.openaiService.imageGenerator(body);
  }
}

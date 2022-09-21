import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import DECORATORS from 'src/common/decorators';
import { MongoIdDTO } from 'src/common/dtos';
import { User } from 'src/common/interfaces';
import { CreateServiceDTO, UpdateServiceDTO } from './dto/service.dto';
import { ServiceService } from './service.service';

@ApiTags('Service')
@Controller('service')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createService(
    @DECORATORS.general.params.Payload('user') user: User,
    @Body() body: CreateServiceDTO,
  ) {
    return this.serviceService.createService(user, body);
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/update')
  async updateService(
    @DECORATORS.general.params.Payload('user') user: User,
    @Body() body: UpdateServiceDTO,
    @Param() param: MongoIdDTO,
  ) {
    return this.serviceService.updateService(user, body, param.id);
  }
}

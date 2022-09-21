import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import DECORATORS from 'src/common/decorators';
import { MongoIdDTO } from 'src/common/dtos';
import { User } from 'src/common/interfaces';
import {
  CreateOrganizationDTO,
  UpdateOrganizationDTO,
} from './dto/organization.dto';
import { OrganizationService } from './organization.service';

@ApiTags('Organization')
@ApiHeader({
  name: 'x-signature-token',
})
@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @ApiBearerAuth()
  @Get()
  @UseGuards(JwtAuthGuard)
  async getOrganization(@DECORATORS.general.params.Payload('user') user: User) {
    return this.organizationService.getOrganization(user);
  }

  @ApiBearerAuth()
  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createOrganization(
    @DECORATORS.general.params.Payload('user') user: User,
    @Body() body: CreateOrganizationDTO,
  ) {
    return this.organizationService.createOrganization(user, body);
  }

  @ApiBearerAuth()
  @Post(':id/update')
  @UseGuards(JwtAuthGuard)
  async updateOrganization(
    @DECORATORS.general.params.Payload('user') user: User,
    @Body() body: UpdateOrganizationDTO,
    @Param() param: MongoIdDTO,
  ) {
    return this.organizationService.updateOrganization(user, body, param.id);
  }
}

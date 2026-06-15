import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { StoreConfigService } from './store-config.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('store-config')
export class StoreConfigController {
  constructor(private readonly service: StoreConfigService) {}

  @Get('public')
  getPublic() {
    return this.service.getPublic();
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getAll() {
    return this.service.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  update(@Body() body: Record<string, string>) {
    return this.service.set(body);
  }
}

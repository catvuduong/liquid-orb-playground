import { BadRequestException, Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service.js';
import { parseOrbSettings } from './orb-settings.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  health() {
    return this.appService.health();
  }

  @Get('items')
  listItems() {
    return this.appService.listItems();
  }

  @Post('items')
  addItem(@Body() body: { title?: string }) {
    const title = body?.title?.trim();
    if (!title) throw new BadRequestException('title is required');
    return this.appService.addItem(title);
  }

  @Get('presets')
  listPresets() {
    return this.appService.listPresets();
  }

  @Post('presets')
  addPreset(@Body() body: { name?: unknown; settings?: unknown }) {
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    if (!name || name.length > 60)
      throw new BadRequestException('name must be 1-60 characters');
    return this.appService.addPreset(name, parseOrbSettings(body.settings));
  }
}

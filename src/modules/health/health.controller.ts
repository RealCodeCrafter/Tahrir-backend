import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('health')
@Controller()
export class HealthController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @Public()
  @Get('health')
  async health() {
    const db = this.dataSource.isInitialized;
    return {
      status: db ? 'ok' : 'degraded',
      service: 'tahrir-backend',
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('stats')
  stats() {
    return {
      users: '10k+',
      documents: '50k+',
      accuracy: '98%',
      languages: ['uz', 'ru', 'en'],
    };
  }
}

import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller()
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get('/healthz')
  healthz(): string {
    console.log('App Health Check');
    return this.health.healthz();
  }

  @Get('/readyz')
  readyz(): string {
    console.log('App Readiness Check');
    return this.health.readyz();
  }
}

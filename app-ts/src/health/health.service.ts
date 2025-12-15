import { Injectable } from '@nestjs/common';
import { createWriteStream } from 'fs';

@Injectable()
export class HealthService {
  healthz(): string {
    return 'OK! - V2';
  }

  readyz(): string {
    return 'OK! - V2';
  }

}

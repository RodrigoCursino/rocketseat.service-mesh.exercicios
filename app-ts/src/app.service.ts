import { Injectable } from '@nestjs/common';
import { createWriteStream } from 'fs';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getExample(): string {
    const file = createWriteStream('rocketseat.txt');

    for (let i = 0; i < 10000; i++) {
      file.write('Kubernetes Rocks!\n');
     }
    file.end();

    return 'File created with 10,000 lines!';
  }

}

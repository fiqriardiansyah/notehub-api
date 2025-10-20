import { Controller, Get } from '@nestjs/common';

@Controller('/')
export class AppController {
  constructor() {}

  @Get()
  initialize() {
    return {
      success: 'hello world!!!',
    };
  }
}

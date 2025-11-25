import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Root endpoint. Returns a hello message.' })
  @ApiResponse({
    status: 200,
    description: 'Returns default hello string',
    type: String,
  })
  getHello(): string {
    return this.appService.getHello();
  }
}

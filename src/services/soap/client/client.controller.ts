import { Body, Controller, Post } from '@nestjs/common';
import { ClientService } from './client.service';

@Controller('/services/soap/client')
export class ClientController {
  constructor(private clientService: ClientService) {}

  @Post('methods')
  findMethods(@Body('wsdl') wsdl) {
    return this.clientService.findMethods(wsdl);
  }

  @Post('input')
  findInput(@Body('wsdl') wsdl, @Body('method') method) {
    return this.clientService.findInput(wsdl, method);
  }
}

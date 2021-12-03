import { Injectable } from '@nestjs/common';
import soap, { Client } from 'soap';
import _ from 'lodash';

@Injectable()
export class ClientService {
  async findMethods(wsdlUrl: string) {
    const client = await soap.createClientAsync(wsdlUrl);
    const description = this.getDescription(client);
    return Object.keys(description);
  }

  async findInput(wsdlUrl: string, method: string) {
    const client = await soap.createClientAsync(wsdlUrl);
    const description = this.getDescription(client);
    if (method in description && 'input' in description[method]) {
      return description[method].input;
    }
    return false;
  }

  async callMethod(wsdlUrl: string, method: string, input: any) {
    const client = await soap.createClientAsync(wsdlUrl);
    const methodName = method + 'Async';
    if (methodName in client) {
      const fn = client[methodName];
      const result = await fn.call(null, input);
      const [response, _, error] = result;
      return { response, error };
    }

    return {
      response: false,
      error: 'Invalid input data',
    };
  }

  getDescription(client: Client) {
    const { definitions } = client.wsdl;
    const { portTypes } = definitions;
    const firsKey = _.first(Object.keys(portTypes));
    return portTypes[firsKey].description(definitions);
  }
}

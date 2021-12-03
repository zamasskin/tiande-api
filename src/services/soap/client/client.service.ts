import { Injectable } from '@nestjs/common';
import { Client } from 'soap';
import * as soap from 'soap';
import * as _ from 'lodash';

@Injectable()
export class ClientService {
  async findMethods(wsdlUrl: string) {
    try {
      const client = await soap.createClientAsync(wsdlUrl);
      const description = this.getDescription(client);
      return Object.keys(description);
    } catch (e) {
      return {
        statusCode: 500,
        message: e.message,
      };
    }
  }

  async findInput(wsdlUrl: string, method: string) {
    try {
      const client = await soap.createClientAsync(wsdlUrl);
      const description = this.getDescription(client);
      if (method in description && 'input' in description[method]) {
        const inputs = description[method].input;
        return this.parseInput(inputs);
      }
      throw new Error('method not found');
    } catch (e) {
      return {
        statusCode: 500,
        message: e.message,
      };
    }
  }

  parseInput(input: any) {
    const excludeProps = ['targetNSAlias', 'targetNamespace'];
    const matchArr = /\[\]$/;
    if (input && typeof input === 'object') {
      const newInput = {};
      for (const key in input) {
        if (excludeProps.includes(key)) continue;
        const value = input[key];
        const newValue =
          value && typeof value === 'object' ? this.parseInput(value) : value;
        newInput[key.replace(matchArr, '')] = matchArr.test(key)
          ? [newValue]
          : newValue;
      }
      return newInput;
    }
    return input;
  }

  async callMethod(wsdlUrl: string, method: string, input: any) {
    try {
      const client = await soap.createClientAsync(wsdlUrl);
      const methodName = method + 'Async';
      if (methodName in client) {
        const fn = client[methodName];
        const result = await fn.call(null, input);
        const [response, _, error] = result;
        return { response, error };
      }
      throw new Error('Invalid input data');
    } catch (e) {
      return {
        statusCode: 500,
        message: e.message,
      };
    }
  }

  getDescription(client: Client) {
    const { definitions } = client.wsdl;
    const { portTypes } = definitions;
    const firsKey = _.first(Object.keys(portTypes));
    return portTypes[firsKey].description(definitions);
  }
}

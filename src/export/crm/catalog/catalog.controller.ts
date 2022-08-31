import { Controller, Post, Put } from '@nestjs/common';
import { CatalogService } from './catalog.service';

@Controller('/export/crm/catalog')
export class CatalogController {
  constructor(private catalogService: CatalogService) {}

  @Post()
  export() {
    return this.catalogService.export();
  }
}

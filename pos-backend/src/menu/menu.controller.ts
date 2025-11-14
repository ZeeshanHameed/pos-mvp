import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MenuService } from './menu.service';

@ApiTags('menu')
@Controller({ path: 'menu', version: '1' })
export class MenuController {
  constructor(private readonly menu: MenuService) {}

  @Get()
  @ApiOperation({ summary: 'List menu items (uses cache on Firestore failure)' })
  async list() {
    const items = await this.menu.listMenu();
    return { items };
  }
}


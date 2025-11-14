import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ListOrdersDto } from './dto/list-orders.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { OptionalAuthGuard } from '../common/guards/optional-auth.guard';
import { StaffOnlyGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/user.decorator';

@ApiTags('orders')
@Controller({ path: 'orders', version: '1' })
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(private readonly orders: OrdersService) {}

  @Post()
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({
    summary: 'Create order (public endpoint - optional auth)',
  })
  async create(@Body() dto: CreateOrderDto, @CurrentUser() user?: any) {
    // Debug logging to check if user is being passed correctly
    this.logger.debug(`Creating order - User: ${user ? JSON.stringify(user) : 'null'}`);

    const res = await this.orders.createOrder({
      items: dto.items,
      discount: dto.discount,
      order_type: dto.order_type,
      customer: dto.customer,
      order_by: user ? user : null,
      userId: user?.id,
    });
    return res;
  }

  @Get()
  @UseGuards(AuthGuard, StaffOnlyGuard)
  @ApiOperation({ summary: 'List orders (staff-only)' })
  async list(@Query() q: ListOrdersDto) {
    const data = await this.orders.listOrders(q);
    return { orders: data };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get order details by ID (public - for customers to track orders)',
  })
  async getOrder(@Param('id') id: string) {
    const order = await this.orders.getOrderById(id);
    return { order };
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard, StaffOnlyGuard)
  @ApiOperation({
    summary: 'Update order status (staff-only, validates transitions)',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateOrderStatusDto,
    @CurrentUser() user: any,
  ) {
    const res = await this.orders.updateStatus(id, body.order_status, user.id);
    return res;
  }
}

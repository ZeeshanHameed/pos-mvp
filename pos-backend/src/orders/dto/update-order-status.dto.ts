import { IsIn } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsIn(['Pending', 'In Progress', 'Ready', 'Completed'], {
    message: 'Order status must be one of: Pending, In Progress, Ready, Completed'
  })
  order_status: 'Pending' | 'In Progress' | 'Ready' | 'Completed';
}


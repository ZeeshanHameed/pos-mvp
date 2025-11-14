import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Validate,
  ValidateNested,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

class OrderItemInput {
  @IsString({ message: 'Item ID must be a string' })
  @IsNotEmpty({ message: 'Item ID is required' })
  id: string;

  @IsString({ message: 'Item name must be a string' })
  @IsNotEmpty({ message: 'Item name is required' })
  name: string;

  @IsNumber({}, { message: 'Item price must be a number' })
  @Min(0, { message: 'Item price must be at least 0' })
  price: number;

  @IsInt({ message: 'Item quantity must be an integer' })
  @Min(1, { message: 'Item quantity must be at least 1' })
  qty: number;
}

class CustomerInput {
  @IsString({ message: 'Customer name must be a string' })
  @IsNotEmpty({ message: 'Customer name is required' })
  name: string;

  @IsString({ message: 'Delivery address must be a string' })
  @IsOptional()
  delivery_address?: string;
}

@ValidatorConstraint({ name: 'DeliveryAddressRequired', async: false })
class DeliveryAddressRequiredConstraint implements ValidatorConstraintInterface {
  validate(customer: CustomerInput, args: any) {
    const dto = args.object as CreateOrderDto;
    if (dto.order_type === 'online') {
      return !!customer?.delivery_address && customer.delivery_address.trim().length > 0;
    }
    return true;
  }

  defaultMessage() {
    return 'Delivery address is required for online orders';
  }
}

export class CreateOrderDto {
  @IsArray({ message: 'Items must be an array' })
  @ArrayMinSize(1, { message: 'At least one item is required' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemInput)
  items: OrderItemInput[];

  @IsOptional()
  @IsNumber({}, { message: 'Discount must be a number' })
  discount?: number;

  @IsIn(['online', 'in-store'], { message: 'Order type must be either online or in-store' })
  @IsNotEmpty({ message: 'Order type is required' })
  order_type: 'online' | 'in-store';

  // Customer information
  @ValidateNested()
  @Type(() => CustomerInput)
  @IsNotEmpty({ message: 'Customer information is required' })
  @Validate(DeliveryAddressRequiredConstraint)
  customer: CustomerInput;
}

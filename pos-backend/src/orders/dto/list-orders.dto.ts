import { IsIn, IsInt, IsOptional, Min } from 'class-validator';

export class ListOrdersDto {
  @IsOptional()
  @IsIn(['Pending', 'In Progress', 'Ready', 'Completed'], {
    message: 'Status must be one of: Pending, In Progress, Ready, Completed'
  })
  status?: 'Pending' | 'In Progress' | 'Ready' | 'Completed';

  @IsOptional()
  start?: string; // ISO date string

  @IsOptional()
  end?: string; // ISO date string

  @IsOptional()
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  limit?: number = 50;
}


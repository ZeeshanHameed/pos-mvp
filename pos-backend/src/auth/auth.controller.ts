import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiResponse as ApiResp } from '../common/dto/api-response.dto';

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Staff login' })
  async login(@Body() dto: LoginDto): Promise<ApiResp> {
    const user = await this.auth.validateUser(dto.email, dto.password);
    return ApiResp.ok({ user, token: this.auth.signToken(user) }, 'Logged in');
  }
}


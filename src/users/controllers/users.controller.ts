import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/auth.decorator';
import { CreateUserDto } from '../dto/create-user.dto';
import { UsersService } from '../users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get users' })
  @ApiResponse({ status: 200, description: 'List of users received' })
  @Auth()
  @Get()
  async findMany() {
    return this.usersService.findMany();
  }

  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({ status: 201, description: 'User created' })
  @ApiResponse({ status: 400, description: 'User not created, wrong data' })
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}

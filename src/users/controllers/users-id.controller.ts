import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/auth.decorator';
import { User, UserPayload } from '../user.decorator';
import { UsersService } from '../users.service';

@Auth()
@ApiTags('users/:id')
@Controller('users/:id/')
export class UsersIdController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get user by id' })
  @ApiResponse({ status: 200, description: 'User by id received' })
  @ApiResponse({ status: 404, description: 'User by id not found' })
  @Get('')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOneById(id);
  }

  @ApiOperation({ summary: "Get user's rooms" })
  @ApiResponse({ status: 200, description: 'Self rooms received' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Get('rooms')
  readRooms(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getRooms(id);
  }

  @ApiOperation({ summary: "Get user's friends" })
  @ApiResponse({ status: 200, description: "Users's friends received" })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Get('friends')
  readFriends(
    @User() user: UserPayload,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.usersService.getFriends(id);
  }
}

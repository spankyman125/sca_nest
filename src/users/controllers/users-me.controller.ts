import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/auth.decorator';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User, UserPayload } from '../user.decorator';
import { UsersService } from '../users.service';
import { Prisma } from '@prisma/client';
import { UnprocessableEntity } from 'src/shared/errors/business-errors';

@Auth()
@ApiTags('users/me')
@Controller('users/me/')
export class UsersMeController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get self user' })
  @ApiResponse({ status: 200, description: 'Self User received' })
  @Get('')
  async findSelf(@User() user: UserPayload) {
    return this.usersService.findOneById(user.sub);
  }

  @ApiOperation({ summary: 'Update self user' })
  @ApiResponse({ status: 200, description: 'User updated' })
  @Patch('')
  async updateUserSelf(
    @User() user: UserPayload,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(user.sub, updateUserDto);
  }

  @ApiOperation({ deprecated: true, summary: 'Delete self user' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  @Delete('')
  async deleteUserSelf() {
    return null;
  }

  @ApiOperation({ summary: 'Delete self user' })
  @ApiResponse({ status: 200, description: 'Self User deleted' })
  @Delete('')
  async deleteSelf(@User() user: UserPayload) {
    return this.usersService.remove(user.sub);
  }

  @ApiOperation({ summary: 'Get self rooms' })
  @ApiResponse({ status: 200, description: 'Self rooms received' })
  @Get('rooms')
  async readRoomsSelf(@User() user: UserPayload) {
    return this.usersService.getRooms(user.sub);
  }

  @ApiOperation({ summary: 'Join room' })
  @ApiResponse({ status: 201, description: 'Room joined' })
  @ApiResponse({ status: 400, description: 'Room already joined' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @Post('rooms')
  async joinRoomSelf(
    @User() user: UserPayload,
    @Query('roomId', ParseIntPipe) roomId: number,
  ) {
    return this.usersService.addToRoom(user.sub, roomId).catch((e) => {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002')
          throw new BadRequestException('Room already joined');
        else if (e.code === 'P2003')
          throw new NotFoundException('Room not found');
        throw e;
      }
    });
  }

  @ApiOperation({ summary: 'Leave room with specified id' })
  @ApiResponse({ status: 200, description: 'Room left' })
  @ApiResponse({ status: 404, description: 'Room not joined' })
  @Delete('rooms/:id')
  async leaveRoomSelf(
    @User() user: UserPayload,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.usersService.leaveRoom(user.sub, id);
  }

  @ApiOperation({ summary: 'Get self messages' })
  @ApiResponse({ status: 200, description: 'Self messages received' })
  @Get('messages')
  async readMessagesSelf(@User() user: UserPayload) {
    return this.usersService.getMessages(user.sub);
  }

  @ApiOperation({ summary: 'Get self friends' })
  @ApiResponse({ status: 200, description: 'Self friends received' })
  @Get('friends')
  async readFriendsSelf(@User() user: UserPayload) {
    return this.usersService.getFriends(user.sub);
  }

  @ApiOperation({ summary: 'Add new friend' })
  @ApiResponse({ status: 201, description: 'New friend added' })
  @ApiResponse({ status: 400, description: 'Friend already added' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Post('friends')
  async newFriendsSelf(
    @User() user: UserPayload,
    @Query('friendId', ParseIntPipe) friendId: number,
  ) {
    return this.usersService.addFriend(user.sub, friendId).catch((e) => {
      if (e instanceof UnprocessableEntity) {
        throw new BadRequestException('Cannot add yourself as a friend');
      } else if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2003') throw new NotFoundException('User not found');
        else if (e.code === 'P2002')
          throw new BadRequestException('Friend already added');
      }
      throw e;
    });
  }

  @ApiOperation({ summary: 'Remove specified friend' })
  @ApiResponse({ status: 200, description: 'Friend removed' })
  @ApiResponse({ status: 404, description: 'Friend not found' })
  @Delete('friends/:id')
  async removeFriend(
    @User() user: UserPayload,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.usersService.removeFriend(user.sub, id);
  }
}

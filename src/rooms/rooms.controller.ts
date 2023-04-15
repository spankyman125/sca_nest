import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/auth.decorator';
import { User, UserPayload } from 'src/users/user.decorator';
import { AddUserDto } from './dto/add-user.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomsService } from './rooms.service';

@Auth()
@ApiTags('rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @ApiOperation({ summary: 'Get rooms' })
  @ApiResponse({ status: 200, description: 'Rooms received' })
  @Get('')
  async findMany() {
    return this.roomsService.findMany();
  }

  @ApiOperation({ summary: 'Create new room' })
  @ApiResponse({ status: 201, description: 'Room created' })
  @Post()
  async create(
    @User() user: UserPayload,
    @Body() createRoomDto: CreateRoomDto,
  ) {
    return await this.roomsService.create(user.sub, createRoomDto);
  }

  @ApiOperation({ summary: 'Get room with specified id' })
  @ApiResponse({ status: 200, description: 'Room received' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @Get(':id')
  async get(@Param('id', ParseIntPipe) roomId: number) {
    return this.roomsService.findOne(roomId).catch(() => {
      throw new NotFoundException('Room not found');
    });
  }

  @ApiOperation({ summary: 'Update room with specified id' })
  @ApiResponse({ status: 201, description: 'Room updated' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) roomId: number,
    @Body() updateRoomDto: UpdateRoomDto,
  ) {
    return this.roomsService.update(roomId, updateRoomDto).catch(() => {
      throw new NotFoundException('Room not found');
    });
  }

  @ApiOperation({ summary: 'Delete room with specified id' })
  @ApiResponse({ status: 200, description: 'Room deleted' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) roomId: number) {
    return await this.roomsService.remove(roomId).catch(() => {
      throw new NotFoundException('Room not found');
    });
  }

  @ApiOperation({ summary: 'Get room messages with specified id' })
  @ApiResponse({ status: 200, description: 'Room messages received' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @Get(':id/messages')
  async getMessages(@Param('id', ParseIntPipe) roomId: number) {
    return await this.roomsService.getMessages(roomId).catch(() => {
      throw new NotFoundException('Room not found');
    });
  }

  @ApiOperation({ summary: "Get room's users with specified id" })
  @ApiResponse({ status: 200, description: 'Room users received' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @Get(':id/users')
  async getUsers(@Param('id', ParseIntPipe) roomId: number) {
    return await this.roomsService.getUsers(roomId).catch(() => {
      throw new NotFoundException('Room not found');
    });
  }

  @ApiOperation({ summary: 'Add user to room with specified id' })
  @ApiResponse({ status: 200, description: 'User added to room' })
  @ApiResponse({ status: 400, description: 'User of room not found' })
  @Post(':id/users')
  async addUser(
    @Param('id', ParseIntPipe) roomId: number,
    @Body() addUserDto: AddUserDto,
  ) {
    return await this.roomsService.addUser(roomId, addUserDto.id).catch(() => {
      throw new NotFoundException('User of room not found');
    });
  }

  @ApiOperation({ summary: 'Remove user from room with specified id' })
  @ApiResponse({ status: 200, description: 'User removed from room' })
  @ApiResponse({ status: 404, description: 'User of room not found' })
  @Delete(':id/users/:userId')
  async removeUser(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return await this.roomsService.removeUser(roomId, userId).catch(() => {
      throw new NotFoundException('User of room not found');
    });
  }
}

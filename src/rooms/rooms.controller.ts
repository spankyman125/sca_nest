import { Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Patch, Post, UnprocessableEntityException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/auth.decorator';
import { User, UserPayload } from 'src/users/user.decorator';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomsService } from './rooms.service';

@ApiTags('rooms')
@Controller('rooms')
export class RoomsController {
  constructor(
    private readonly roomsService: RoomsService
  ) { }

  @ApiOperation({ summary: "Get room with specified id" })
  @Auth()
  @Get('/:id')
  async get(@Param('id', ParseIntPipe) roomId: number) {
    const room = await this.roomsService.findOne(roomId);
    if (!room) throw new NotFoundException()
    return room
  }

  @ApiOperation({ summary: "Create new room with specified name" })
  @Auth()
  @Post()
  async create(@User() user: UserPayload, @Body() createRoomDto: CreateRoomDto) {
    const createdRoom = await this.roomsService.create(user.sub, createRoomDto.name);
    if (!createdRoom) throw new UnprocessableEntityException()
    return createdRoom
  }

  @ApiOperation({ summary: "Join room with specified id" })
  @Auth()
  @Patch('/:id/join')
  async join(@User() user: UserPayload, @Param('id', ParseIntPipe) roomId: number) {
    const joinedRoom = await this.roomsService.join(user.sub, roomId);
    if (joinedRoom === undefined) throw new NotFoundException()
    return joinedRoom
  }

  @ApiOperation({ summary: "Leave room with specified id" })
  @Auth()
  @Patch('/:id/leave')
  async leave(@User() user: UserPayload, @Param('id', ParseIntPipe) roomId: number) {
    const leavedRoom = await this.roomsService.leave(user.sub, roomId);
    if (leavedRoom === undefined) throw new NotFoundException()
    if (leavedRoom === null) throw new UnprocessableEntityException()
    return leavedRoom;
  }

  @ApiOperation({ summary: "Get room messages with specified id" })
  @Auth()
  @Get('/:id/messages')
  async getMessages(@Param('id', ParseIntPipe) roomId: number) {
    const messages = await this.roomsService.getMessages(roomId);
    if (messages == null) throw new NotFoundException()
    return messages;
  }

  @ApiOperation({ summary: "Delete room with specified id" })
  @Auth()
  @Delete('/:id')
  async delete(@Param('id', ParseIntPipe) roomId: number) {
    const deletedRoom = await this.roomsService.delete(roomId);
    if (!deletedRoom) throw new NotFoundException()
  }

}

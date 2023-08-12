import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { randomUUID } from 'crypto';
import { diskStorage } from 'multer';
import { extname } from 'path';
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

  @ApiOperation({ summary: 'Search rooms' })
  @ApiResponse({ status: 200, description: 'List of rooms received' })
  @ApiQuery({ name: 'name', required: false, type: String })
  @Auth()
  @Get('/search')
  async search(@Query('name') name?: string) {
    return this.roomsService.search(name);
  }

  @ApiOperation({ summary: 'Create new room' })
  @ApiResponse({ status: 201, description: 'Room created' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './public/static/images/rooms/avatars/',
        filename: (req, file, cb) => {
          cb(null, `${randomUUID()}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @Post()
  async create(
    @User() user: UserPayload,
    @Body() createRoomDto: CreateRoomDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 1024 * 1024 })],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ) {
    return await this.roomsService.create(user.sub, createRoomDto, file);
  }

  @ApiOperation({ summary: 'Get room with specified id' })
  @ApiResponse({ status: 200, description: 'Room received' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @Get(':id')
  async get(@Param('id', ParseIntPipe) roomId: number) {
    return this.roomsService.findOne(roomId);
  }

  @ApiOperation({ summary: 'Update room with specified id' })
  @ApiResponse({ status: 201, description: 'Room updated' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) roomId: number,
    @Body() updateRoomDto: UpdateRoomDto,
  ) {
    return this.roomsService.update(roomId, updateRoomDto);
  }

  @ApiOperation({ summary: 'Delete room with specified id' })
  @ApiResponse({ status: 200, description: 'Room deleted' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) roomId: number) {
    return await this.roomsService.remove(roomId);
  }

  @ApiOperation({ summary: 'Get room messages with specified id' })
  @ApiResponse({ status: 200, description: 'Room messages received' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @Get(':id/messages')
  async getMessages(
    @Param('id', ParseIntPipe) roomId: number,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
    @Query('take', new DefaultValuePipe(50), ParseIntPipe) take?: number,
  ) {
    return await this.roomsService.getMessages(roomId, skip, take);
  }

  @ApiOperation({ summary: "Get room's users with specified id" })
  @ApiResponse({ status: 200, description: 'Room users received' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @Get(':id/users')
  async getUsers(@Param('id', ParseIntPipe) roomId: number) {
    return await this.roomsService.getUsers(roomId);
  }

  @ApiOperation({ summary: 'Add user to room with specified id' })
  @ApiResponse({ status: 201, description: 'User added to room' })
  @ApiResponse({ status: 400, description: 'User of room not found' })
  @ApiResponse({ status: 404, description: 'User already joined room' })
  @Post(':id/users')
  async addUser(
    @Param('id', ParseIntPipe) roomId: number,
    @Body() addUserDto: AddUserDto,
    @User() user: UserPayload,
  ) {
    return await this.roomsService.addUser(roomId, addUserDto.id, user.sub);
  }

  @ApiOperation({ summary: 'Remove user from room with specified id' })
  @ApiResponse({ status: 200, description: 'User removed from room' })
  @ApiResponse({ status: 404, description: 'User of room not found' })
  @Delete(':roomId/users/:userId')
  async removeUser(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @User() user: UserPayload,
  ) {
    return await this.roomsService.removeUser(roomId, userId, user.sub);
  }
}

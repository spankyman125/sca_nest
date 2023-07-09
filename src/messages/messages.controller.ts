import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/auth.decorator';
import { User, UserPayload } from 'src/users/user.decorator';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessagesService } from './messages.service';

@Auth()
@ApiTags('messages')
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @ApiOperation({ summary: 'Create message in room with specified id' })
  @ApiResponse({ status: 201, description: 'Message created' })
  // @ApiResponse({ status: 400, description: 'Message not created, wrong data' })
  // @ApiResponse({ status: 403, description: 'Not enough permissions' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @Post('')
  async createMessage(
    @Query('roomId', ParseIntPipe) roomId: number,
    @User() user: UserPayload,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return await this.messagesService.createMessage(
      roomId,
      user.sub,
      createMessageDto,
    );
  }

  @ApiOperation({ summary: 'Update message in room with specified id' })
  @ApiResponse({ status: 200, description: 'Message updated' })
  // @ApiResponse({ status: 400, description: 'Message not updated, wrong data' })
  // @ApiResponse({ status: 403, description: 'Not enough permissions' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @Patch(':messageId')
  async updateMessage(
    @Param('messageId', ParseIntPipe) messageId: number,
    @User() user: UserPayload,
    @Body() updateMessageDto: CreateMessageDto,
  ) {
    return await this.messagesService.updateMessage(
      user.sub,
      messageId,
      updateMessageDto,
    );
  }
}

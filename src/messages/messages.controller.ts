import {
  Body,
  Controller,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/auth.decorator';
import { User, UserPayload } from 'src/users/user.decorator';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessagesService } from './messages.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { extname } from 'path';

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
  @UseInterceptors(
    FilesInterceptor('attachments', 10, {
      storage: diskStorage({
        destination: './public/static/images/messages/',
        filename: (req, file, cb) => {
          cb(null, `${randomUUID()}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  @Post('')
  async createMessage(
    @Query('roomId', ParseIntPipe) roomId: number,
    @User() user: UserPayload,
    @Body() createMessageDto: CreateMessageDto,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 1024 * 1024 })],
        fileIsRequired: false,
      }),
    )
    attachments?: Express.Multer.File[],
  ) {
    return await this.messagesService.createMessage(
      roomId,
      user.sub,
      createMessageDto,
      attachments,
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

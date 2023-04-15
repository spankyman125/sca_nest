import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMessageDto } from 'src/messages/dto/create-message.dto';
import { UpdateMessageDto } from 'src/messages/dto/update-message.dto';
import { EntityNotFoundError } from 'src/shared/errors/business-errors';
import { SocketServerService } from 'src/socket/socket.service';

@Injectable()
export class MessagesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly socketServerService: SocketServerService,
  ) {}

  async createMessage(
    roomId: number,
    userId: number,
    { content }: CreateMessageDto,
  ) {
    return this.prismaService.message
      .create({
        data: {
          content,
          user: { connect: { id: userId } },
          room: { connect: { id: roomId } },
        },
      })
      .catch(() => {
        throw new EntityNotFoundError();
      });
  }

  async updateMessage(
    userId: number,
    messageId: number,
    { content }: UpdateMessageDto,
  ) {
    return this.prismaService.message
      .update({
        where: { id: messageId },
        data: { content },
      })
      .catch(() => {
        throw new EntityNotFoundError();
      });
  }
}

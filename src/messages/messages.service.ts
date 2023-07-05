import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from 'src/messages/dto/create-message.dto';
import { UpdateMessageDto } from 'src/messages/dto/update-message.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { EntityNotFoundError } from 'src/shared/errors/business-errors';
import { MessagesEmitterService } from './messages.emitter.service';

@Injectable()
export class MessagesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly emitter: MessagesEmitterService,
  ) {}

  async createMessage(
    roomId: number,
    userId: number,
    { content }: CreateMessageDto,
  ) {
    const newMessage = await this.prismaService.message
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
    this.emitter.messageNew(userId, roomId, newMessage);
  }

  async updateMessage(
    userId: number,
    messageId: number,
    { content }: UpdateMessageDto,
  ) {
    const updatedMessage = await this.prismaService.message
      .update({
        where: { id: messageId },
        data: { content },
      })
      .catch(() => {
        throw new EntityNotFoundError();
      });
    this.emitter.messageEdit(userId, updatedMessage);
    return updatedMessage;
  }
}

import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from 'src/messages/dto/create-message.dto';
import { UpdateMessageDto } from 'src/messages/dto/update-message.dto';
import { PrismaService } from 'src/prisma/prisma.service';
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
    attachments?: Express.Multer.File[],
  ) {
    const newMessage = await this.prismaService.message.create({
      include: { user: true, attachments: true },
      data: {
        content,
        user: { connect: { id: userId } },
        room: { connect: { id: roomId } },
      },
    });
    if (attachments)
      for (let i = 0; i < attachments.length; i++) {
        const attachment = attachments[i];
        newMessage.attachments.push(
          await this.prismaService.attachment.create({
            data: {
              messageId: newMessage.id,
              url: attachment.path.replace('public/', ''),
            },
          }),
        );
      }
    this.emitter.messageNew(userId, roomId, newMessage);
    return newMessage;
  }

  async updateMessage(
    userId: number,
    messageId: number,
    { content }: UpdateMessageDto,
  ) {
    const updatedMessage = await this.prismaService.message.update({
      where: { id: messageId },
      include: { user: true },
      data: { content },
    });
    this.emitter.messageEdit(userId, updatedMessage);
    return updatedMessage;
  }
}

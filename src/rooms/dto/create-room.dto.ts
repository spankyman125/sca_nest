import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoomDto {
  @ApiProperty()
  name: string;

  @ApiPropertyOptional({ deprecated: true })
  avatarUrl?: string;
}

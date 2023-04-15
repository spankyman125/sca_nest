import { ApiProperty } from '@nestjs/swagger';

export class AddUserDto {
  @ApiProperty()
  id: number;
}

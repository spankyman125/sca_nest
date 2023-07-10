import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class AddUserDto {
  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  id: number;
}

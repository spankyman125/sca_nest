import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty()
  username: string;

  @ApiProperty()
  pseudonym: string;

  @ApiProperty()
  password: string;
}

import { PickType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class ChangePseudonymDto extends PickType(CreateUserDto, ['pseudonym'] as const) { }

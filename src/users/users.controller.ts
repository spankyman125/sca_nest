import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/auth.decorator';
import { ChangePseudonymDto } from './dto/change-pseudonym-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserPayload } from './user.decorator';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @ApiOperation({ summary: "Create user" })
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // @Get()
  // findAll() {
  //   return this.usersService.findAll();
  // }

  @ApiOperation({ summary: "Get user by specified id" })
  @Get(':id')
  readUserById(@Param('id') id: number) {
    return this.usersService.findOneById(+id);
  }
  
  @ApiOperation({ summary: "Get user by specified username" })
  @Get(':id')
  readUserByUsername(@Param('id') username: string) {
    return this.usersService.findOneByUsername(username);
  }
  
  @ApiOperation({ summary: "Change pseudonym for specified id" })
  @Auth()
  @Patch('/changePseudonym')
  changePseudonym(@User() user: UserPayload, @Body() changePseudonymDto: ChangePseudonymDto) {
    return this.usersService.changePseudonym(user.sub, changePseudonymDto.pseudonym);
  }

  @ApiOperation({ summary: "Add friend with specified id" })
  @Auth()
  @Patch(':id/addFriend')
  addFriend(@Param('id') id: string) {
    return this.usersService.addFriend(+id);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.usersService.remove(+id);
  // }
}

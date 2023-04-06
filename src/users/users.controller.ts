import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @ApiOperation({ description: "Create user" })
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // @Get()
  // findAll() {
  //   return this.usersService.findAll();
  // }

  @ApiOperation({ description: "Get user by specified id" })
  @Get(':id')
  readUserById(@Param('id') id: number) {
    return this.usersService.findOneById(+id);
  }
  
  @ApiOperation({ description: "Get user by specified username" })
  @Get(':id')
  readUserByUsername(@Param('id') username: string) {
    return this.usersService.findOneByUsername(username);
  }

  @ApiOperation({ description: "Change username for specified id" })
  @Patch(':id')
  changeUsername(@Param('id') id: string, @Body() username: string) {
    return this.usersService.changePseudonym(+id, username);
  }

  @ApiOperation({ description: "Add friend with specified id" })
  @Patch(':id/addFriend')
  addFriend(@Param('id') id: string) {
    return this.usersService.addFriend(+id);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.usersService.remove(+id);
  // }
}

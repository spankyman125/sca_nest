import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ChangePseudonymDto } from './dto/change-pseudonym-user.dto';

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
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Patch('/changeUsername')
  changeUsername(@Request() req, @Body() changePseudonymDto: ChangePseudonymDto) {
    return this.usersService.changePseudonym(req.user.sub, changePseudonymDto.pseudonym);
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

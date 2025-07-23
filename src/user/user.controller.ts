import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { Request } from 'express';
import { CreateUserDto, UpdateUserDto } from './dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get('me')
  getMe(@Req() req: Request) {
    return req['userInDb'];
  }

  @Patch('me')
  async updateMyProfile(@Req() req: Request, @Body() updateUserDto: UpdateUserDto) {
    const myEmail = req['userInDb'].email;
    return this.userService.update(myEmail, updateUserDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.LECTURER, UserRole.ADMIN)
  findAll() {
    return this.userService.findAll();
  }

  @Get(':identifier')
  @UseGuards(RolesGuard)
  @Roles(UserRole.LECTURER, UserRole.ADMIN)
  findOne(@Param('identifier') identifier: string) {
    if (identifier.includes('@')) {
      return this.userService.findOneByEmail(identifier);
    } else {
      return this.userService.findOneByUid(identifier);
    }
  }

  @Patch(':identifier')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('identifier') identifier: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(identifier, updateUserDto);
  }

  @Delete(':identifier')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('identifier') identifier: string) {
    return this.userService.remove(identifier);
  }
}
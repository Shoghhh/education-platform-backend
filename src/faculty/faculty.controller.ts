// src/faculty/faculty.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { FacultyService } from './faculty.service';
import { CreateFacultyDto, UpdateFacultyDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('faculties')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class FacultyController {
  constructor(private readonly facultyService: FacultyService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createFacultyDto: CreateFacultyDto) {
    return this.facultyService.create(createFacultyDto);
  }

  @Get()
  @Roles(UserRole.STUDENT, UserRole.LECTURER, UserRole.ADMIN)
  findAll() {
    return this.facultyService.findAll();
  }

  @Get(':identifier')
  @Roles(UserRole.STUDENT, UserRole.LECTURER, UserRole.ADMIN)
  findOne(@Param('identifier') identifier: string) {
    return this.facultyService.findOne(identifier);
  }

  @Patch(':identifier')
  @Roles(UserRole.ADMIN)
  update(@Param('identifier') identifier: string, @Body() updateFacultyDto: UpdateFacultyDto) {
    return this.facultyService.update(identifier, updateFacultyDto);
  }

  @Delete(':identifier')
  @Roles(UserRole.ADMIN)
  remove(@Param('identifier') identifier: string) {
    return this.facultyService.remove(identifier);
  }
}
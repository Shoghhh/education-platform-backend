import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ParseUUIDPipe } from '@nestjs/common';
import { ClassScheduleService } from './class-schedule.service';
import { CreateClassScheduleDto, UpdateClassScheduleDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('class-schedules')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClassScheduleController {
  constructor(private readonly classScheduleService: ClassScheduleService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createClassScheduleDto: CreateClassScheduleDto) {
    return this.classScheduleService.create(createClassScheduleDto);
  }

  @Get()
  @Roles(UserRole.STUDENT, UserRole.LECTURER, UserRole.ADMIN)
  findAll() {
    return this.classScheduleService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.STUDENT, UserRole.LECTURER, UserRole.ADMIN)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.classScheduleService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateClassScheduleDto: UpdateClassScheduleDto) {
    return this.classScheduleService.update(id, updateClassScheduleDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.classScheduleService.remove(id);
  }
}
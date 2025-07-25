import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TimeSlotService } from './time-slot.service';
import { CreateTimeSlotDto, ShiftTimeSlotDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('time-slots')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class TimeSlotController {
  constructor(private readonly timeSlotService: TimeSlotService) { }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createTimeSlotDto: CreateTimeSlotDto) {
    return this.timeSlotService.create(createTimeSlotDto);
  }

  @Get()
  @Roles(UserRole.STUDENT, UserRole.LECTURER, UserRole.ADMIN)
  findAll() {
    return this.timeSlotService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.STUDENT, UserRole.LECTURER, UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.timeSlotService.findOne(id);
  }

  @Post('shift')
  @Roles(UserRole.ADMIN)
  async shiftAll(@Body() shiftTimeSlotsDto: ShiftTimeSlotDto) {
    return this.timeSlotService.shiftAllTimeSlots(shiftTimeSlotsDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.timeSlotService.remove(id);
  }
}
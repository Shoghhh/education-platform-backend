import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AcademicPeriodService } from './academic-period.service';
import { CreateAcademicPeriodDto } from './dto/create-academic-period.dto';
import { UpdateAcademicPeriodDto } from './dto/update-academic-period.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';

@Controller('academic-period')
@UseGuards(JwtAuthGuard, RolesGuard) 
export class AcademicPeriodController {
  constructor(private readonly academicPeriodService: AcademicPeriodService) {}

  @Post()
  @Roles(UserRole.ADMIN) 
  create(@Body() createAcademicPeriodDto: CreateAcademicPeriodDto) {
    return this.academicPeriodService.create(createAcademicPeriodDto);
  }

  @Get()
  @Roles(UserRole.STUDENT, UserRole.LECTURER, UserRole.ADMIN)
  findAll() {
    return this.academicPeriodService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.STUDENT, UserRole.LECTURER, UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.academicPeriodService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateAcademicPeriodDto: UpdateAcademicPeriodDto) {
    return this.academicPeriodService.update(id, updateAcademicPeriodDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.academicPeriodService.remove(id);
  }
}

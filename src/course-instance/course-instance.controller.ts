import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, BadRequestException, ParseUUIDPipe, ForbiddenException } from '@nestjs/common';
import { CourseInstanceService } from './course-instance.service';
import { CreateCourseInstanceDto, UpdateCourseInstanceDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { Request } from 'express';
import { User } from 'src/user/entities/user.entity';

declare module 'express' {
  interface Request {
    userInDb: User;
  }
}

@Controller('course-instances')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CourseInstanceController {
  constructor(private readonly courseInstanceService: CourseInstanceService) { }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createCourseInstanceDto: CreateCourseInstanceDto) {
    return this.courseInstanceService.create(createCourseInstanceDto);
  }

  @Get()
  @Roles(UserRole.STUDENT, UserRole.LECTURER, UserRole.ADMIN)
  findAll() {
    return this.courseInstanceService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.STUDENT, UserRole.LECTURER, UserRole.ADMIN)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.courseInstanceService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.LECTURER, UserRole.ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCourseInstanceDto: UpdateCourseInstanceDto,
    @Req() req: Request
  ) {
    const currentUser = req.userInDb;

    if (currentUser.role === UserRole.ADMIN) {
      return this.courseInstanceService.update(id, updateCourseInstanceDto);
    }

    // --- Lecturer-specific permission checks begin here ---
    // At this point, we know the user is a LECTURER.

    // 1. Lecturer must be assigned to this instance to modify its resources.
    // Fetch the instance to check its current lecturer.
    const instance = await this.courseInstanceService.findOne(id);

    if (!instance.lecturer || instance.lecturer.uid !== currentUser.uid) {
      // If the instance has no lecturer, or the lecturer is not the current user
      throw new ForbiddenException('As a Lecturer, you can only update course instances you are currently assigned to teach.');
    }
    // 2. Check if the lecturer is attempting to update fields other than 'resourceIds'.
    // Get all keys from the DTO that have a defined value (i.e., are being sent in the request body).
    const dtoKeys = Object.keys(updateCourseInstanceDto);
    // Filter for any keys that are NOT 'resourceIds'
    const forbiddenFields = dtoKeys.filter(key => key !== 'resourceIds');
    if (forbiddenFields.length > 0) {
      throw new BadRequestException(`As a Lecturer, you can only update 'resourceIds'. Attempted to update: ${forbiddenFields.join(', ')}.`);
    }
    // If execution reaches here for a LECTURER, it means:
    // - They are the assigned lecturer for this instance.
    // - They are only attempting to update 'resourceIds'.
    return this.courseInstanceService.update(id, updateCourseInstanceDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.courseInstanceService.remove(id);
  }
}
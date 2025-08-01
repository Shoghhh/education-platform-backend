import { Module } from '@nestjs/common';
import { CourseInstanceService } from './course-instance.service';
import { CourseInstanceController } from './course-instance.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseInstance } from './entities/course-instance.entity';
import { AuthModule } from 'src/auth/auth.module';
import { CourseModule } from 'src/course/course.module';
import { AcademicPeriodModule } from 'src/academic-period/academic-period.module';
import { UserModule } from 'src/user/user.module';
import { FacultyModule } from 'src/faculty/faculty.module';
import { ResourceModule } from 'src/resource/resource.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseInstance]),
    AuthModule,
    CourseModule,
    AcademicPeriodModule,
    UserModule,
    FacultyModule,
    ResourceModule,
  ],
  controllers: [CourseInstanceController],
  providers: [CourseInstanceService],
  exports: [CourseInstanceService, TypeOrmModule],
})
export class CourseInstanceModule {}

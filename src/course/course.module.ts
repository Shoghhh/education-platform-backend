import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course]),
    AuthModule
  ],
  controllers: [CourseController],
  providers: [CourseService],
  exports: [CourseService, TypeOrmModule]
})
export class CourseModule { }

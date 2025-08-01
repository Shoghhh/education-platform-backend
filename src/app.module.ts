import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './config/database.config';
import { UserModule } from './user/user.module';
import { FirebaseModule } from './firebase/firebase.module';
import { AuthModule } from './auth/auth.module';
import { CourseModule } from './course/course.module';
import { AcademicPeriodModule } from './academic-period/academic-period.module';
import { TimeSlotModule } from './time-slot/time-slot.module';
import { FacultyModule } from './faculty/faculty.module';
import { ResourceModule } from './resource/resource.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';
import { MulterModule } from '@nestjs/platform-express';
import { CourseInstanceModule } from './course-instance/course-instance.module';
import { LocationModule } from './location/location.module';
import { ClassScheduleModule } from './class-schedule/class-schedule.module';

@Module({
  imports: [
    MulterModule.register({
      limits: {
        fileSize: 1024 * 1024 * 0.5,
        fieldSize: 1024 * 1024 * 10
      }
    }),
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', '..', 'uploads'), // Path to your uploads directory
      serveRoot: '/uploads', // The URL path to serve files from
    }),
    TypeOrmModule.forRoot(databaseConfig),
    UserModule,
    FirebaseModule,
    AuthModule,
    CourseModule,
    AcademicPeriodModule,
    TimeSlotModule,
    FacultyModule,
    ResourceModule,
    CourseInstanceModule,
    LocationModule,
    ClassScheduleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
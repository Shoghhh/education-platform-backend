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

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    UserModule,
    FirebaseModule,
    AuthModule,
    CourseModule,
    AcademicPeriodModule,
    TimeSlotModule,
    FacultyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
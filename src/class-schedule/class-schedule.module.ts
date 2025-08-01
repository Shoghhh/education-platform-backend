import { Module } from '@nestjs/common';
import { ClassScheduleService } from './class-schedule.service';
import { ClassScheduleController } from './class-schedule.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { ClassSchedule } from './entities/class-schedule.entity';
import { CourseInstanceModule } from 'src/course-instance/course-instance.module';
import { TimeSlotModule } from 'src/time-slot/time-slot.module';
import { LocationModule } from 'src/location/location.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClassSchedule]),
    AuthModule,
    CourseInstanceModule,
    TimeSlotModule,
    LocationModule,
  ],
  controllers: [ClassScheduleController],
  providers: [ClassScheduleService],
  exports: [TypeOrmModule, ClassScheduleService]
})
export class ClassScheduleModule { }

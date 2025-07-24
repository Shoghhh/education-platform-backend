import { Module } from '@nestjs/common';
import { AcademicPeriodService } from './academic-period.service';
import { AcademicPeriodController } from './academic-period.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicPeriod } from './entities/academic-period.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AcademicPeriod]),
    AuthModule
  ],
  controllers: [AcademicPeriodController],
  providers: [AcademicPeriodService],
  exports: [AcademicPeriodService, TypeOrmModule],
})
export class AcademicPeriodModule { }

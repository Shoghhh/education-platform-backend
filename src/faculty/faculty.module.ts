import { Module } from '@nestjs/common';
import { FacultyService } from './faculty.service';
import { FacultyController } from './faculty.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Faculty } from './entities/faculty.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Faculty]),
    AuthModule
  ],
  controllers: [FacultyController],
  providers: [FacultyService],
  exports: [FacultyService, TypeOrmModule]
})
export class FacultyModule { }

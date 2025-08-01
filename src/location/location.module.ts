import { Module } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from './entities/location.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Location]),
    AuthModule
  ],
  controllers: [LocationController],
  providers: [LocationService],
  exports: [TypeOrmModule, LocationService]
})
export class LocationModule {}

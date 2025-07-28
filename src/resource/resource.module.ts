import { Module } from '@nestjs/common';
import { ResourceService } from './resource.service';
import { ResourceController } from './resource.controller';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resource } from './entities/resource.entity';
import { FileCleanupInterceptor } from 'src/common/interceptors/file-cleanup.interceptor';
@Module({
  imports: [
    TypeOrmModule.forFeature([Resource]), 
    AuthModule,
  ],
  controllers: [ResourceController],
  providers: [ResourceService, FileCleanupInterceptor],
  exports: [ResourceService, TypeOrmModule]
})
export class ResourceModule {}

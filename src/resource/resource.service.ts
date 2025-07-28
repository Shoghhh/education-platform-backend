import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resource } from './entities/resource.entity';
import { CreateResourceDto, UpdateResourceDto } from './dto';
import { UserService } from '../user/user.service';
import * as path from 'path';
import * as fs from 'fs/promises';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

@Injectable()
export class ResourceService {
  constructor(
    @InjectRepository(Resource)
    private resourcesRepository: Repository<Resource>,
    private userService: UserService,
  ) { }

  async create(createResourceDto: CreateResourceDto, uploadedByUid: string, file: Express.Multer.File): Promise<Resource> {
    const uploader = await this.userService.findOneByUid(uploadedByUid);
    if (!uploader || (uploader.role !== 'lecturer' && uploader.role !== 'admin')) {
      throw new BadRequestException('UploadedBy UID must belong to an existing lecturer or admin user.');
    }

    if (!file) {
      throw new BadRequestException('No file uploaded.');
    }

    const resource = this.resourcesRepository.create({
      title: createResourceDto.title,
      description: createResourceDto.description,
      url: `/uploads/${file.filename}`,
      uploadedByUid: uploadedByUid,
      uploadDate: new Date(),
    });

    return this.resourcesRepository.save(resource);
  }

  async findAll(): Promise<Resource[]> {
    return this.resourcesRepository.find({ relations: ['uploadedBy'] });
  }

  async findOne(id: string): Promise<Resource> {
    const resource = await this.resourcesRepository.findOne({ where: { id }, relations: ['uploadedBy'] });
    if (!resource) {
      throw new NotFoundException(`Resource with ID "${id}" not found.`);
    }
    return resource;
  }

  async update(id: string, updateResourceDto: UpdateResourceDto): Promise<Resource> {
    const resource = await this.findOne(id);
    this.resourcesRepository.merge(resource, updateResourceDto);
    return this.resourcesRepository.save(resource);
  }

  async remove(id: string): Promise<void> {
    const resource = await this.findOne(id);
    try {
        const UPLOADS_DIR_SERVICE = path.join(process.cwd(), 'uploads');
        const relativeFilePath = resource.url.replace('/uploads/', '');
        const fullFilePath = path.join(UPLOADS_DIR_SERVICE, relativeFilePath);
        await fs.unlink(fullFilePath);
    } catch (error) {
        console.warn(`Failed to delete file from disk for resource ${id}: ${resource.url}`, error);
    }

    const result = await this.resourcesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Resource with ID "${id}" not found.`);
    }
  }

  async cleanupUploadedFile(filePath: string): Promise<void> {
    try {
      console.log('cleanupUploadedFile')
      if (filePath.startsWith(UPLOADS_DIR)) {
         await fs.unlink(filePath);
         console.warn(`Successfully cleaned up temporary file: ${filePath}`);
      } else {
         await fs.unlink(filePath);
         console.warn(`Successfully cleaned up non-local temporary file: ${filePath}`);
      }
    } catch (error) {
      console.error(`Failed to delete temporary file ${filePath} during cleanup:`, error);
    }
  }
}
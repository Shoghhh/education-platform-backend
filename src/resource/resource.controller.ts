import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, BadRequestException, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, } from '@nestjs/common';
import { ResourceService } from './resource.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateResourceDto, UpdateResourceDto } from './dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { Request } from 'express';
import { FileCleanupInterceptor } from 'src/common/interceptors/file-cleanup.interceptor';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

const multerStorageOptions = {
  storage: diskStorage({
    destination: UPLOADS_DIR,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const fileExt = path.extname(file.originalname);
      const fileName = `${file.fieldname}-${uniqueSuffix}${fileExt}`;
      cb(null, fileName);
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword', // For .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // For .docx
      'application/vnd.ms-powerpoint', // For .ppt
      'application/vnd.openxmlformats-officedocument.presentationml.presentation' // For .pptx
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new BadRequestException('Only image, PDF, and document files are allowed!'), false);
    }
    cb(null, true);
  },
};

@Controller('resources')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) { }

  @Post()
  @Roles(UserRole.LECTURER, UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file', multerStorageOptions), FileCleanupInterceptor)
  async create(
    @Body() createResourceDto: CreateResourceDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
        ],
        fileIsRequired: true,
      })
    ) file: Express.Multer.File,
    @Req() req: Request,
  ) {
    const authenticatedUid = req['userInDb'].uid;
    if (authenticatedUid === null || authenticatedUid === undefined) {
      throw new BadRequestException('Authenticated user ID is missing.');
    }
    return this.resourceService.create(createResourceDto, authenticatedUid, file);
  }

  @Get()
  @Roles(UserRole.STUDENT, UserRole.LECTURER, UserRole.ADMIN)
  findAll() {
    return this.resourceService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.STUDENT, UserRole.LECTURER, UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.resourceService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.LECTURER, UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateResourceDto: UpdateResourceDto, @Req() req: Request) {
    const resource = await this.resourceService.findOne(id);
    if (resource.uploadedByUid !== req['userInDb'].uid && req['userInDb'].role !== UserRole.ADMIN) {
      throw new BadRequestException('You are not authorized to update this resource.');
    }
    return this.resourceService.update(id, updateResourceDto);
  }

  @Delete(':id')
  @Roles(UserRole.LECTURER, UserRole.ADMIN)
  async remove(@Param('id') id: string, @Req() req: Request) {
    const resource = await this.resourceService.findOne(id);
    if (resource.uploadedByUid !== req['userInDb'].uid && req['userInDb'].role !== UserRole.ADMIN) {
      throw new BadRequestException('You are not authorized to delete this resource.');
    }
    return this.resourceService.remove(id);
  }
}

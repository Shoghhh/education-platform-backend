import { Test, TestingModule } from '@nestjs/testing';
import { CourseInstanceController } from './course-instance.controller';
import { CourseInstanceService } from './course-instance.service';

describe('CourseInstanceController', () => {
  let controller: CourseInstanceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseInstanceController],
      providers: [CourseInstanceService],
    }).compile();

    controller = module.get<CourseInstanceController>(CourseInstanceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

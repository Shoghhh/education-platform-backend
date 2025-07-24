import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private coursesRepository: Repository<Course>,
  ) { }

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const course = this.coursesRepository.create(createCourseDto)
    return this.coursesRepository.save(course);
  }

  async findAll(): Promise<Course[]> {
    return this.coursesRepository.find();
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.coursesRepository.findOne({ where: { id } });
    if (!course) {
      throw new NotFoundException(`Course with ID "${id}" not found.`);
    }
    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const course = await this.findOne(id)
    this.coursesRepository.merge(course, updateCourseDto)
    return this.coursesRepository.save(course);
  }

  async remove(id: string): Promise<void> {
    const result = await this.coursesRepository.delete(id)
    if (result.affected === 0) {
      throw new NotFoundException(`Course with ID "${id}" not found.`);
    }
  }
}

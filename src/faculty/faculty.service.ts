import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Faculty } from './entities/faculty.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FacultyService {
  constructor(
    @InjectRepository(Faculty)
    private facultiesRepository: Repository<Faculty>
  ) { }

  async create(createFacultyDto: CreateFacultyDto): Promise<Faculty> {
    const existingFacultyByCode = await this.facultiesRepository.findOne({ where: { code: createFacultyDto.code } });
    if (existingFacultyByCode) {
      throw new BadRequestException(`Faculty with code "${createFacultyDto.code}" already exists.`);
    }

    // const existingFacultyByName = await this.facultiesRepository.findOne({ where: { name: createFacultyDto.name } })
    // if (existingFacultyByName) {
    //   throw new BadRequestException(`Faculty with name "${createFacultyDto.name}" already exists.`);
    // }

    const faculty = this.facultiesRepository.create(createFacultyDto);
    return this.facultiesRepository.save(faculty);
  }

  async findAll(): Promise<Faculty[]> {
    return this.facultiesRepository.find({ order: { name: 'ASC' } });
  }

  async findOneById(id: string): Promise<Faculty> {
    const faculty = await this.facultiesRepository.findOne({ where: { id } });
    if (!faculty) {
      throw new NotFoundException(`Faculty with ID "${id}" not found.`);
    }
    return faculty;
  }

  async findOneByCode(code: string): Promise<Faculty> {
    const faculty = await this.facultiesRepository.findOne({ where: { code } });
    if (!faculty) {
      throw new NotFoundException(`Faculty with code "${code}" not found.`);
    }
    return faculty;
  }

  async findOne(identifier: string): Promise<Faculty> {
    // Heuristic: if it looks like a UUID, try by ID; otherwise, by code
    if (identifier.length === 36 && identifier.includes('-')) {
      return this.findOneById(identifier);
    }
    return this.findOneByCode(identifier);
  }

  async update(identifier: string, updateFacultyDto: UpdateFacultyDto): Promise<Faculty> {
    const faculty = await this.findOne(identifier); // Use unified find

    // If code is being updated and if the new code already exists for another faculty
    if (updateFacultyDto.code && updateFacultyDto.code !== faculty.code) {
        const existingWithNewCode = await this.facultiesRepository.findOne({ where: { code: updateFacultyDto.code } });
        if (existingWithNewCode) {
            throw new BadRequestException(`Faculty with code "${updateFacultyDto.code}" already exists.`);
        }
    }
    // If name is being updated and if name should be unique, check for uniqueness here.

    this.facultiesRepository.merge(faculty, updateFacultyDto);
    return this.facultiesRepository.save(faculty);
  }

  async remove(identifier: string): Promise<void> {
    // IMPORTANT: Before deleting a faculty, ensure no Users or CourseInstances are linked to it.
    // This check should happen BEFORE actual deletion to prevent foreign key constraint errors.
    // Example: 
    // const usersInFaculty = await this.usersRepository.count({ where: { facultyId: faculty.id } });
    // if (usersInFaculty > 0) { throw new BadRequestException('Cannot delete faculty with associated users.'); }

    const faculty = await this.findOne(identifier); // Use unified find
    const result = await this.facultiesRepository.delete(faculty.id); // Delete by internal ID
    if (result.affected === 0) {
      throw new NotFoundException(`Faculty with identifier "${identifier}" not found or could not be deleted.`);
    }
  }
}

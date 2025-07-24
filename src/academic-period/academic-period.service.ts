import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAcademicPeriodDto } from './dto/create-academic-period.dto';
import { UpdateAcademicPeriodDto } from './dto/update-academic-period.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AcademicPeriod } from './entities/academic-period.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AcademicPeriodService {
  constructor(
    @InjectRepository(AcademicPeriod)
    private academicPeriodsRepository: Repository<AcademicPeriod>,
  ) { }

  async create(createAcademicPeriodDto: CreateAcademicPeriodDto): Promise<AcademicPeriod> {
    const generatedId = `${createAcademicPeriodDto.calendarYear}_${createAcademicPeriodDto.semesterNumber}`;

    const existingPeriod = await this.academicPeriodsRepository.findOne({
      where: { id: generatedId }
    })
    if (existingPeriod) {
      throw new BadRequestException(`Academic period with ID "${generatedId}" (derived from year/semester) already exists.`);
    }

    const academicPeriod = this.academicPeriodsRepository.create({
      ...createAcademicPeriodDto,
      id: generatedId,
      startDate: new Date(createAcademicPeriodDto.startDate),
      endDate: new Date(createAcademicPeriodDto.endDate),
    });
    return this.academicPeriodsRepository.save(academicPeriod);
  }

  async findAll(): Promise<AcademicPeriod[]> {
    return this.academicPeriodsRepository.find({ order: { calendarYear: 'ASC', semesterNumber: 'ASC' } });
  }

  async findOne(id: string): Promise<AcademicPeriod> {
    const academicPeriod = await this.academicPeriodsRepository.findOne({ where: { id } });
    if (!academicPeriod) {
      throw new NotFoundException(`Academic period with ID "${id}" not found.`);
    }
    return academicPeriod;
  }

  async update(id: string, updateAcademicPeriodDto: UpdateAcademicPeriodDto): Promise<AcademicPeriod> {
    const academicPeriod = await this.findOne(id);

    // Merge DTO and handle date conversion if present in update
    const updatedData: Partial<AcademicPeriod> = { ...updateAcademicPeriodDto };
    if (updateAcademicPeriodDto.startDate) {
      updatedData.startDate = new Date(updateAcademicPeriodDto.startDate);
    }
    if (updateAcademicPeriodDto.endDate) {
      updatedData.endDate = new Date(updateAcademicPeriodDto.endDate);
    }

    this.academicPeriodsRepository.merge(academicPeriod, updatedData);
    return this.academicPeriodsRepository.save(academicPeriod);
  }

  async remove(id: string): Promise<void> {
    const result = await this.academicPeriodsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Academic period with ID "${id}" not found.`);
    }
  }
}

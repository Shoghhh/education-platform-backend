import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateClassScheduleDto } from './dto/create-class-schedule.dto';
import { UpdateClassScheduleDto } from './dto/update-class-schedule.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ClassSchedule } from './entities/class-schedule.entity';
import { Equal, Not, Repository } from 'typeorm';
import { CourseInstanceService } from 'src/course-instance/course-instance.service';
import { TimeSlotService } from 'src/time-slot/time-slot.service';
import { LocationService } from 'src/location/location.service';
import { DayOfWeek } from 'src/common/enums/day-of-week.enum';
import { CourseInstance } from 'src/course-instance/entities/course-instance.entity';
import { TimeSlot } from 'src/time-slot/entities/time-slot.entity';
import { Location } from 'src/location/entities/location.entity';

@Injectable()
export class ClassScheduleService {

  constructor(
    @InjectRepository(ClassSchedule)
    private classSchedulesRepository: Repository<ClassSchedule>,
    private courseInstanceService: CourseInstanceService,
    private timeSlotService: TimeSlotService,
    private locationService: LocationService
  ) { }

  private async checkDoubleBooking(
    timeSlotId: string,
    dayOfWeek: DayOfWeek,
    locationId: string,
    excludeId?: string
  ): Promise<void> {
    const where: any = { timeSlotId, dayOfWeek, locationId };
    if (excludeId) {
      where.id = Not(Equal(excludeId));
    }

    const existingSchedule = await this.classSchedulesRepository.findOne({ where });

    if (existingSchedule) {
      throw new BadRequestException(
        `This location (${locationId}) is already booked for ${dayOfWeek} at the ${timeSlotId} time slot.`
      );
    }
  }

  private async getRelatedEntities(dto: CreateClassScheduleDto | UpdateClassScheduleDto): Promise<{
    courseInstance?: CourseInstance;
    timeSlot?: TimeSlot;
    location?: Location;
  }> {
    const [courseInstance, timeSlot, location] = await Promise.all([
      dto.courseInstanceId ? this.courseInstanceService.findOne(dto.courseInstanceId) : Promise.resolve(undefined),
      dto.timeSlotId ? this.timeSlotService.findOne(dto.timeSlotId) : Promise.resolve(undefined),
      dto.locationId ? this.locationService.findOne(dto.locationId) : Promise.resolve(undefined),
    ]);

    return { courseInstance, timeSlot, location };
  }

  async create(createClassScheduleDto: CreateClassScheduleDto): Promise<ClassSchedule> {
    const existingScheduleForCourseInstance = await this.classSchedulesRepository.findOne({
      where: {
        courseInstanceId: createClassScheduleDto.courseInstanceId,
        timeSlotId: createClassScheduleDto.timeSlotId,
        dayOfWeek: createClassScheduleDto.dayOfWeek,
      }
    });
    if (existingScheduleForCourseInstance) {
      throw new BadRequestException('This course instance already has a class scheduled at the specified time and day.');
    }

    await this.checkDoubleBooking(
      createClassScheduleDto.timeSlotId,
      createClassScheduleDto.dayOfWeek,
      createClassScheduleDto.locationId
    );

    const { courseInstance, timeSlot, location } = await this.getRelatedEntities(createClassScheduleDto);

    const classSchedule = this.classSchedulesRepository.create({
      ...createClassScheduleDto,
      courseInstance: courseInstance,
      timeSlot: timeSlot,
      location: location,
    });

    return this.classSchedulesRepository.save(classSchedule);
  }

  async findAll(): Promise<ClassSchedule[]> {
    return this.classSchedulesRepository.find({
      relations: ['courseInstance', 'timeSlot', 'location'],
      order: { dayOfWeek: 'ASC', timeSlot: { order: 'ASC' } } // Sort by day, then time slot order
    });
  }

  async findOne(id: string): Promise<ClassSchedule> {
    const schedule = await this.classSchedulesRepository.findOne({
      where: { id },
      relations: ['courseInstance', 'timeSlot', 'location'],
    });
    if (!schedule) {
      throw new NotFoundException(`Class schedule with ID "${id}" not found.`);
    }
    return schedule;
  }


  async update(id: string, updateClassScheduleDto: UpdateClassScheduleDto): Promise<ClassSchedule> {
    const schedule = await this.findOne(id);

    const newTimeSlotId = updateClassScheduleDto.timeSlotId ?? schedule.timeSlotId;
    const newDayOfWeek = updateClassScheduleDto.dayOfWeek ?? schedule.dayOfWeek;
    const newLocationId = updateClassScheduleDto.locationId ?? schedule.locationId;

    const hasBookingFieldsChanged =
      (updateClassScheduleDto.timeSlotId !== undefined && updateClassScheduleDto.timeSlotId !== schedule.timeSlotId) ||
      (updateClassScheduleDto.dayOfWeek !== undefined && updateClassScheduleDto.dayOfWeek !== schedule.dayOfWeek) ||
      (updateClassScheduleDto.locationId !== undefined && updateClassScheduleDto.locationId !== schedule.locationId);

    if (hasBookingFieldsChanged) {
      await this.checkDoubleBooking(
        newTimeSlotId,
        newDayOfWeek,
        newLocationId,
        id
      );
    }

    const { courseInstance, timeSlot, location } = await this.getRelatedEntities(updateClassScheduleDto);

    const updatedData: Partial<ClassSchedule> = {
      ...updateClassScheduleDto,
      courseInstance: courseInstance || schedule.courseInstance,
      timeSlot: timeSlot || schedule.timeSlot,
      location: location || schedule.location,
    };

    this.classSchedulesRepository.merge(schedule, updatedData);
    return this.classSchedulesRepository.save(schedule);
  }

  async remove(id: string): Promise<void> {
    const result = await this.classSchedulesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Class schedule with ID "${id}" not found.`);
    }
  }
}

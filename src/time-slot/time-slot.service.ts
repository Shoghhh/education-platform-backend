import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimeSlot } from './entities/time-slot.entity';
import { CreateTimeSlotDto, ShiftTimeSlotDto } from './dto';

@Injectable()
export class TimeSlotService {
  constructor(
    @InjectRepository(TimeSlot)
    private timeSlotsRepository: Repository<TimeSlot>,
  ) { }

  private generateOrderFromTime(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return (hours * 100) + minutes;
  }

  private generateIdFromTimes(startTime: string, endTime: string): string {
    const formattedStartTime = startTime.replace(':', '');
    const formattedEndTime = endTime.replace(':', '');
    return `${formattedStartTime}_${formattedEndTime}`;
  }

  async create(createTimeSlotDto: CreateTimeSlotDto): Promise<TimeSlot> {
    const generatedId = this.generateIdFromTimes(createTimeSlotDto.startTime, createTimeSlotDto.endTime);

    const existingSlot = await this.timeSlotsRepository.findOne({ where: { id: generatedId } });
    if (existingSlot) {
      throw new BadRequestException(`Time slot with ID "${generatedId}" (derived from start/end times) already exists.`);
    }

    const generatedOrder = this.generateOrderFromTime(createTimeSlotDto.startTime);

    const newTimeSlot = {
      id: generatedId,
      startTime: createTimeSlotDto.startTime,
      endTime: createTimeSlotDto.endTime,
      order: generatedOrder,
    };
    const timeSlot = this.timeSlotsRepository.create(newTimeSlot);
    return this.timeSlotsRepository.save(timeSlot);
  }

  async findAll(): Promise<TimeSlot[]> {
    return this.timeSlotsRepository.find({ order: { order: 'ASC' } });
  }

  async findOne(id: string): Promise<TimeSlot> {
    const timeSlot = await this.timeSlotsRepository.findOne({ where: { id } });
    if (!timeSlot) {
      throw new NotFoundException(`Time slot with ID "${id}" not found.`);
    }
    return timeSlot;
  }

  async remove(id: string): Promise<void> {
    const result = await this.timeSlotsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Time slot with ID "${id}" not found.`);
    }
  }

  async shiftAllTimeSlots(shiftDto: ShiftTimeSlotDto): Promise<TimeSlot[]> {
    const allTimeSlots = await this.findAll();
    const updatedTimeSlots: TimeSlot[] = [];

    await this.timeSlotsRepository.manager.transaction(async transactionalEntityManager => {
      for (const oldSlot of allTimeSlots) {
        const oldStart = new Date(`2000-01-01T${oldSlot.startTime}:00Z`);
        const oldEnd = new Date(`2000-01-01T${oldSlot.endTime}:00Z`);

        oldStart.setMinutes(oldStart.getMinutes() + shiftDto.minutes);
        oldEnd.setMinutes(oldEnd.getMinutes() + shiftDto.minutes);

        const newStartTime = `${String(oldStart.getUTCHours()).padStart(2, '0')}:${String(oldStart.getUTCMinutes()).padStart(2, '0')}`;
        const newEndTime = `${String(oldEnd.getUTCHours()).padStart(2, '0')}:${String(oldEnd.getUTCMinutes()).padStart(2, '0')}`;

        const newId = this.generateIdFromTimes(newStartTime, newEndTime);
        const newOrder = this.generateOrderFromTime(newStartTime);

        const newSlotData: TimeSlot = {
          ...oldSlot,
          id: newId,
          startTime: newStartTime,
          endTime: newEndTime,
          order: newOrder,
        };

        const existingNewSlot = await transactionalEntityManager.findOne(TimeSlot, { where: { id: newId } });
        if (existingNewSlot && existingNewSlot.id !== oldSlot.id) {
          throw new BadRequestException(`Shift operation failed: New time slot ID "${newId}" clashes with an existing slot.`);
        }

        await transactionalEntityManager.delete(TimeSlot, oldSlot.id);
        const createdNewSlot = transactionalEntityManager.create(TimeSlot, newSlotData);
        await transactionalEntityManager.save(TimeSlot, createdNewSlot);

        updatedTimeSlots.push(createdNewSlot);
      }
    });

    return updatedTimeSlots;
  }
}
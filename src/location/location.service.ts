import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Location)
    private locationsRepository: Repository<Location>,
  ) { }

  private async checkCompositeUniqueConstraint(
    building: number,
    floor: number,
    name: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await this.locationsRepository.findOne({
      where: {
        building,
        floor,
        name,
      },
    });

    if (existing && (!excludeId || existing.id !== excludeId)) {
      throw new BadRequestException(
        `Location with this Building (${building}), Floor (${floor}), and Name ("${name}") already exists.`
      );
    }
  }


  async create(createLocationDto: CreateLocationDto): Promise<Location> {
    const generatedId = `${createLocationDto.building}_${createLocationDto.floor}_${createLocationDto.name}`;
    
    await this.checkCompositeUniqueConstraint(
      createLocationDto.building,
      createLocationDto.floor,
      createLocationDto.name
    );
    const location = this.locationsRepository.create({ ...createLocationDto, id: generatedId });
    return this.locationsRepository.save(location);
  }

  async findAll(): Promise<Location[]> {
    return this.locationsRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Location> {
    const location = await this.locationsRepository.findOne({ where: { id } });
    if (!location) {
      throw new NotFoundException(`Location with ID "${id}" not found.`);
    }
    return location;
  }


  async update(id: string, updateLocationDto: UpdateLocationDto): Promise<Location> {
    const location = await this.findOne(id);

    // === NEW: Check composite unique constraint if defining fields change ===
    // Determine the new values for composite check
    const newBuilding = updateLocationDto.building ?? location.building;
    const newFloor = updateLocationDto.floor ?? location.floor;
    const newName = updateLocationDto.name ?? location.name;

    // Check if any of the composite fields are actually changing
    const hasCompositeFieldsChanged =
      (updateLocationDto.building !== undefined && updateLocationDto.building !== location.building) ||
      (updateLocationDto.floor !== undefined && updateLocationDto.floor !== location.floor) ||
      (updateLocationDto.name !== undefined && updateLocationDto.name !== location.name);

    if (hasCompositeFieldsChanged) {
      await this.checkCompositeUniqueConstraint(
        newBuilding,
        newFloor,
        newName,
        id // Exclude current location's ID from the check
      );
    }
    // === REMOVED: existingWithName check is no longer needed as 'name' is not unique by itself ===

    this.locationsRepository.merge(location, updateLocationDto);
    return this.locationsRepository.save(location);
  }

  async remove(id: string): Promise<void> {
    //todo
    // Example: const hasClassSchedules = await this.classScheduleService.countByLocation(id);
    // if (hasClassSchedules > 0) { throw new BadRequestException('Cannot delete location with associated class schedules.'); }
    const result = await this.locationsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Location with ID "${id}" not found.`);
    }
  }
}

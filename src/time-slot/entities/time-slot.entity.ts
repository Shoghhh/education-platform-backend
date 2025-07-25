import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('time_slots')
export class TimeSlot {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  id: string;

  @Column({ type: 'varchar', length: 5 })
  startTime: string;

  @Column({ type: 'varchar', length: 5 })
  endTime: string;

  @Column({ type: 'int' })
  order: number;

  constructor(partial: Partial<TimeSlot>) {
    Object.assign(this, partial);
  }
}
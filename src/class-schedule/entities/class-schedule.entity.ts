import { ClassType } from "src/common/enums/class-type.enum";
import { DayOfWeek } from "src/common/enums/day-of-week.enum";
import { CourseInstance } from "src/course-instance/entities/course-instance.entity";
import { Location } from "src/location/entities/location.entity";
import { TimeSlot } from "src/time-slot/entities/time-slot.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity("class_schedules")
@Unique(['timeSlotId', 'dayOfWeek', 'locationId'])
@Unique(['courseInstanceId', 'timeSlotId', 'dayOfWeek'])
export class ClassSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  courseInstanceId: string
  @ManyToOne(() => CourseInstance, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseInstanceId', referencedColumnName: 'id' })
  courseInstance: CourseInstance

  @Column({ type: 'varchar', length: 255 })
  timeSlotId: string
  @ManyToOne(() => TimeSlot, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'timeSlotId', referencedColumnName: 'id' })
  timeSlot: TimeSlot

  @Column({ type: 'varchar', length: 255 })
  locationId: string
  @ManyToOne(() => Location, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'locationId', referencedColumnName: 'id' })
  location: Location

  @Column({ type: 'enum', enum: DayOfWeek })
  dayOfWeek: DayOfWeek

  @Column({ type: 'enum', enum: ClassType, nullable: true })
  type: ClassType | null;

  constructor(partial: Partial<ClassSchedule>) {
    Object.assign(this, partial);
  }
}


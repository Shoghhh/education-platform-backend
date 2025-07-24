import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity('academic_periods')
export class AcademicPeriod {
  @PrimaryColumn({type: "varchar", length: 255})
  id: string

  @Column({type: 'varchar', length: 255})
  name: string

  @Column({type: 'timestamp with time zone'})
  startDate: Date

  @Column({type: 'timestamp with time zone'})
  endDate: Date

  @Column({type: "int"})
  calendarYear: number

  @Column({type: 'int'})
  semesterNumber: number

  constructor(partial: Partial<AcademicPeriod>){
    Object.assign(this, partial)
  }
}

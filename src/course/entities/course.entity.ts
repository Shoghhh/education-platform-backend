import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({type: 'varchar', length: 256})
  name: string

  @Column({type: 'text', nullable: true})
  description: string | null

  @Column({type: 'text', nullable: true})
  credits: number | null

  constructor(partial: Partial<Course>){
    Object.assign(this, partial);
  }
}

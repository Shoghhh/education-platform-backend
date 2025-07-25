import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('faculties')
export class Faculty {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({type: 'varchar', length: 255, unique: true })
  code: string

  @Column({type: 'varchar', length: 255})
  name: string

  constructor(partial: Partial<Faculty>){
    Object.assign(this, partial)
  }
}

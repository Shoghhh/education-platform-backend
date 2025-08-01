import { Column, Entity, PrimaryColumn, Unique } from "typeorm";

@Entity("locations")
@Unique(['building', 'floor', 'name'])
export class Location {
  @PrimaryColumn({type: "varchar", length: 255})
  id: string

  @Column({type: "varchar", length: 255})
  name: string

  @Column({type: "int"})
  floor: number

  @Column({type: "int"})
  building: number

  constructor(partial: Partial<Location>) {
    Object.assign(this, partial);
  }
}

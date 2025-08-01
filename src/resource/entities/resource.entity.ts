import { CourseInstance } from "../../course-instance/entities/course-instance.entity";
import { User } from "../../user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity('resources')
export class Resource {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 255 })
  title: string

  @Column({ type: 'text', nullable: true })
  description: string | null

  @Column({ type: 'varchar', length: 2048 })
  url: string

  @Column({ type: 'varchar', length: 255 })
  uploadedByUid: string

  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' }) // Many resources can be uploaded by one user
  @JoinColumn({ name: 'uploadedByUid', referencedColumnName: 'uid' }) // Links uploadedByUid column to User.uid
  uploadedBy: User; // The actual User object linked (not stored in DB column directly)

  @Column({ type: 'timestamp with time zone' })
  uploadDate: Date;

  @ManyToMany(() => CourseInstance, (courseInstance) => courseInstance.resources) // <--- Many-to-many relationship with CourseInstance
  courseInstances: CourseInstance[]; 

  constructor(partial: Partial<Resource>) {
    Object.assign(this, partial);
  }
}

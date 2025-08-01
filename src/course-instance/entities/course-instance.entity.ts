import { AcademicPeriod } from "../../academic-period/entities/academic-period.entity";
import { Course } from "../../course/entities/course.entity";
import { Faculty } from "../../faculty/entities/faculty.entity";
import { Resource } from "../../resource/entities/resource.entity";
import { User } from "../../user/entities/user.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity("course-instances")
@Unique(['courseId', 'academicPeriodId', 'lecturerUid', 'facultyCode', 'studentGroup', 'targetYear']) // Include lecturerUid here
export class CourseInstance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  courseId: string

  @ManyToOne(() => Course, { nullable: false, onDelete: "RESTRICT" })
  @JoinColumn({ name: "courseId", referencedColumnName: "id" })
  course: Course

  @Column({ type: 'varchar', length: 255 })
  academicPeriodId: string

  @ManyToOne(() => AcademicPeriod, { nullable: false, onDelete: "RESTRICT" })
  @JoinColumn({ name: "academicPeriodId", referencedColumnName: "id" })
  academicPeriod: AcademicPeriod

  @Column({ type: "uuid", nullable: true })
  lecturerUid: string | null

  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "lecturerUid", referencedColumnName: "uid" })
  lecturer: User | null

  @Column({ type: "varchar", length: 255 })
  facultyCode: string | null

  @ManyToOne(() => Faculty, { nullable: false, onDelete: "SET NULL" })
  @JoinColumn({ name: "facultyCode", referencedColumnName: "code" })
  faculty: Faculty

  @Column({ type: 'int' })
  studentGroup: number;

  @Column({ type: 'int' })
  targetYear: number;

  @ManyToMany(() => Resource, {cascade: true})
  @JoinTable({
    name: "course_instance_resources",
    joinColumn: {
      name: "courseInstanceId",
      referencedColumnName: "id"
    },
    inverseJoinColumn: {
      name: "resourceId",
      referencedColumnName: "id"
    }
  })
  resources: Resource[]

  constructor(partial: Partial<CourseInstance>) {
    Object.assign(this, partial);
  }
}

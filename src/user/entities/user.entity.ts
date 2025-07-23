import { StudyType } from '../../common/enums/study-type.enum';
import { UserRole } from '../../common/enums/user-role.enum';
import { Entity, Column, Unique, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
@Unique(['email'])
export class User {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  uid: string | null;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  faculty: string | null;

  @Column({ type: 'int', nullable: true })
  enrollmentYear: number | null;

  @Column({ type: 'int', nullable: true })
  studentGroup: number | null;

  @Column({ type: 'enum', enum: StudyType, nullable: true })
  studyType: StudyType | null;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
import { IsString, IsEmail, IsEnum, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';
import { UserRole } from '../../common/enums/user-role.enum';
import { StudyType } from '../../common/enums/study-type.enum';

export class CreateUserDto {
  @IsOptional()
  @IsString()
  uid?: string; // Optional because Firebase UID is linked on first login

  @IsEmail()
  email: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  faculty?: string | null;

  @IsOptional()
  @IsNumber()
  enrollmentYear?: number | null;

  @IsOptional()
  @IsNumber()
  studentGroup?: number | null;

  @IsOptional()
  @IsEnum(StudyType)
  studyType?: StudyType | null;
}
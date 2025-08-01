import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, IsUUID } from 'class-validator';

export class CreateCourseInstanceDto {
  @IsNotEmpty()
  @IsString()
  courseId: string;

  @IsNotEmpty()
  @IsString()
  academicPeriodId: string;

  @IsOptional()
  @IsString()
  lecturerUid?: string | null;

  @IsNotEmpty()
  @IsString()
  facultyCode: string; // FK to Faculty.code (string)

  @IsNotEmpty()
  @IsNumber()
  studentGroup: number;

  @IsNotEmpty()
  @IsNumber()
  targetYear: number;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  resourceIds?: string[];
}
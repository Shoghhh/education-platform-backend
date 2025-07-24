import { IsDateString, IsNotEmpty, IsNumber, IsString } from "class-validator";


export class CreateAcademicPeriodDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsNotEmpty()
  @IsDateString()
  startDate: Date

  @IsNotEmpty()
  @IsDateString()
  endDate: Date

  @IsNotEmpty()
  @IsNumber()
  calendarYear: number;

  @IsNotEmpty()
  @IsNumber()
  semesterNumber: number;

}

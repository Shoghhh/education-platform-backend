import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ClassType } from "src/common/enums/class-type.enum";
import { DayOfWeek } from "src/common/enums/day-of-week.enum";


export class CreateClassScheduleDto {
  @IsNotEmpty()
  @IsString()
  courseInstanceId: string;

  @IsNotEmpty()
  @IsString()
  timeSlotId: string;

  @IsNotEmpty()
  @IsString()
  locationId: string;

  @IsNotEmpty()
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @IsOptional()
  @IsEnum(ClassType)
  type?: ClassType | null;

}

import { IsNumber, IsNotEmpty, Min, Max } from 'class-validator';

export class ShiftTimeSlotDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(-120)
  @Max(120)
  minutes: number;
}
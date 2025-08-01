import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateLocationDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  floor: number;

  @IsNotEmpty()
  @IsNumber()
  building: number;
}
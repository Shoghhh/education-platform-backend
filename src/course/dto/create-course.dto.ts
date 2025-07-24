import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateCourseDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsNumber()
  credits?: number | null;
}

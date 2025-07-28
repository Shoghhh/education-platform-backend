import { IsString, IsNotEmpty, IsOptional, IsUrl, IsDateString } from 'class-validator';

export class CreateResourceDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string | null;
}
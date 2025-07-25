import { IsNotEmpty, IsString } from "class-validator";

export class CreateFacultyDto {
  @IsNotEmpty()
  @IsString()
  code: string; 

  @IsNotEmpty()
  @IsString()
  name: string;
}

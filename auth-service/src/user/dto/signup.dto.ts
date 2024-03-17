import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class SignUpDto {
  name: string;

  surname: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

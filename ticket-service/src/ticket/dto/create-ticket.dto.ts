import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateTicketDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;
}

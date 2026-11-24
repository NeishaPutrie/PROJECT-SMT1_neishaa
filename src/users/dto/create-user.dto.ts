import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'neisha@example.com' })
  @IsEmail({}, { message: 'email harus berupa alamat email yang valid' })
  email: string;

  @ApiProperty({ example: 'Neisha Putrie' })
  @IsString()
  @IsNotEmpty({ message: 'name tidak boleh kosong' })
  name: string;

  @ApiProperty({ example: 'rahasia123', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'password minimal 6 karakter' })
  password: string;
}

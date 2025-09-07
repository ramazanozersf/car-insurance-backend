import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
  IsPhoneNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../shared/enums';

export class RegisterDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiProperty({ enum: UserRole, required: false, default: UserRole.CUSTOMER })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ContactStatus } from '../../../common/enums';

export class CreateContactDto {
  @IsString()
  @MinLength(2)
  fullName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @MinLength(5)
  message: string;
}

export class UpdateContactDto {
  @IsOptional()
  @IsEnum(ContactStatus)
  status?: ContactStatus;
}

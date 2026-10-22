import { IsEnum, IsString, MinLength } from 'class-validator';
import { RewriteStyle } from '../../../common/enums';

export class CheckTextDto {
  @IsString()
  @MinLength(1)
  text: string;
}

export class RewriteTextDto {
  @IsString()
  @MinLength(1)
  text: string;

  @IsEnum(RewriteStyle)
  style: RewriteStyle;
}

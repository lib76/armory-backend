import { IsString, Matches } from 'class-validator';

export class ApplyTemplatesDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: 'month must be YYYY-MM' })
  month: string;
}

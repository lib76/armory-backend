import { PartialType } from '@nestjs/mapped-types';
import { CreateManualIncomeDto } from './create-manual-income.dto';

export class UpdateManualIncomeDto extends PartialType(CreateManualIncomeDto) {}

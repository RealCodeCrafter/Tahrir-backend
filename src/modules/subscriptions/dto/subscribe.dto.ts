import { IsEnum, IsUUID } from 'class-validator';
import { BillingPeriod } from '../../../common/enums';

export class CreateSubscriptionDto {
  @IsUUID()
  planId: string;

  @IsEnum(BillingPeriod)
  billingPeriod: BillingPeriod;
}

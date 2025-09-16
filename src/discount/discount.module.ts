import { Module } from '@nestjs/common';
import { DiscountService } from './discount.service';
import { DiscountController } from './discount.controller';
import { DiscountRepo } from './discount.repository';

@Module({
  controllers: [DiscountController],
  providers: [DiscountService, DiscountRepo],
})
export class DiscountModule {}

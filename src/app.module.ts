import { Module } from '@nestjs/common';

import { DiscountModule } from './discount/discount.module';

@Module({
  imports: [DiscountModule],
})
export class AppModule {}

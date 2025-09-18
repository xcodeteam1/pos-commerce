import { Module } from '@nestjs/common';

import { DiscountModule } from './discount/discount.module';
import { GuestModule } from './guest/guest.module';
import { LikedModule } from './liked/liked.module';

@Module({
  imports: [DiscountModule, GuestModule, LikedModule],
})
export class AppModule {}

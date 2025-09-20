import { Module } from '@nestjs/common';

import { DiscountModule } from './discount/discount.module';
import { GuestModule } from './guest/guest.module';
import { LikedModule } from './liked/liked.module';
import { UserModule } from './user/user.module';
import { UserLikedModule } from './user_liked/user_liked.module';
import { SaleModule } from './sale/sale.module';

@Module({
  imports: [DiscountModule, GuestModule, LikedModule, UserModule, UserLikedModule, SaleModule],
})
export class AppModule {}

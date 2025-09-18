import { Module } from '@nestjs/common';
import { GuestService } from './guest.service';
import { GuestController } from './guest.controller';
import { GuestRepo } from './guest.repository';

@Module({
  controllers: [GuestController],
  providers: [GuestService, GuestRepo],
})
export class GuestModule {}

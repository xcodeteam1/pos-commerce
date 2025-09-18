import { Module } from '@nestjs/common';
import { LikedService } from './liked.service';
import { LikedController } from './liked.controller';
import { LikedRepo } from './liked.repository';

@Module({
  controllers: [LikedController],
  providers: [LikedService, LikedRepo],
})
export class LikedModule {}

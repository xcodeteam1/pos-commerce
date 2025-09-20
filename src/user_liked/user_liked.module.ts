import { Module } from '@nestjs/common';
import { UserLikedService } from './user_liked.service';
import { UserLikedController } from './user_liked.controller';
import { UserLikedRepository } from './user_liked.repository';

@Module({
  controllers: [UserLikedController],
  providers: [UserLikedService, UserLikedRepository],
})
export class UserLikedModule {}

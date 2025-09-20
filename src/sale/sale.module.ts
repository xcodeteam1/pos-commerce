import { Module } from '@nestjs/common';
import { SaleService } from './sale.service';
import { SaleController } from './sale.controller';
import { SaleRepo } from './sale.repository';

@Module({
  controllers: [SaleController],
  providers: [SaleService, SaleRepo],
})
export class SaleModule {}

import { Injectable } from '@nestjs/common';
import { GuestRepo } from './guest.repository';
import { CreateGuestDto } from './dto/create-guest.dto';

@Injectable()
export class GuestService {
  constructor(private readonly guestRepo: GuestRepo) {}

  async create(ip: string, createGuestDto: CreateGuestDto) {
    return this.guestRepo.create({
      guest_ip: ip,
      description: createGuestDto.description,
    });
  }

  async findAll(page: number, pageSize: number, search?: string) {
    return this.guestRepo.getAll(page, pageSize, search);
  }

  async findOne(id: number) {
    return this.guestRepo.getById(id);
  }

  async remove(id: number) {
    return this.guestRepo.delete(id);
  }
}

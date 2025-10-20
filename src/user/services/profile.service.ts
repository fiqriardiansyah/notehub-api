import { Injectable } from '@nestjs/common';

@Injectable()
export class ProfileService {
  constructor() {}

  async execute(userId: string) {
    return {
      id: userId,
      name: 'fiqri',
      email: 'fiqri',
    };
  }
}

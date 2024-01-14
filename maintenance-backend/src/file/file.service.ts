import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { File } from '../entities/file.entity';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File)
    private fileRepo: Repository<File>,
  ) {}

  async createFile(data: File) {
    const file = this.fileRepo.create(data);
    return await this.fileRepo.save(file);
  }

  async deleteFile(id: string) {
    return await this.fileRepo.delete({ id });
  }
}

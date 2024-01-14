import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Comment } from '../entities/comment.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepo: Repository<Comment>,
  ) {}

  async createComment(data: Comment) {
    const comment = this.commentRepo.create(data);
    return await this.commentRepo.save(comment);
  }

  async getCommentByMaintenance(id: string) {
    return await this.commentRepo.findOne({ maintenance: { id } });
  }

  async deleteTaskComments(id: string) {
    return await this.commentRepo.delete({ task: { id } });
  }

  async updateComment(data: Comment) {
    await this.commentRepo.update(data.id, data);
    return await this.commentRepo.findOne({ id: data.id });
  }
}

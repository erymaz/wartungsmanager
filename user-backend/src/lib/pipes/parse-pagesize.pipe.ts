import { Injectable } from '@nestjs/common';
import * as Joi from 'joi';

import { JoiPipe } from './joi.pipe';

@Injectable()
export class ParsePageSizePipe extends JoiPipe {
  constructor() {
    super(Joi.number().integer().positive().optional(), {});
  }
}

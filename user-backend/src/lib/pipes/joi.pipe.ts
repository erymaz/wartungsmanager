import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import * as Joi from 'joi';

@Injectable()
export class JoiPipe implements PipeTransform {
  constructor(
    private readonly schema: Joi.Schema,
    private readonly opts: { [key: string]: number | boolean | string } = {},
  ) {}

  transform(payload: unknown, metadata: ArgumentMetadata): unknown {
    return JoiPipe.validate(payload, this.schema, this.opts, metadata);
  }

  static validate<T>(
    payload: unknown,
    schema: Joi.Schema,
    opts: { [key: string]: number | boolean | string } = {},
    metadata: ArgumentMetadata = { type: 'custom' },
  ): T {
    schema = metadata.data ? schema.label(metadata.data) : schema;

    const { error, value } = schema.validate(payload, opts || {});

    if (error) {
      // Provide a special response with reasons
      const reasons = error.details.map((detail: { message: string }) => detail.message).join(', ');
      throw new BadRequestException(
        `Request validation of ${metadata.type} item '${metadata.data}' failed, because: ${reasons}`,
      );
    }

    // Everything is fine
    return value as T;
  }
}

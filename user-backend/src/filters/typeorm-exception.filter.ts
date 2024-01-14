import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class TypeormExceptionFilter implements ExceptionFilter {
  catch(exception: { code: string }, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse();

    switch (exception.code) {
      case 'ER_DUP_ENTRY':
        response.status(400).json({
          statusCode: 400,
          message: 'Entity with some of these fields already exists!',
        });
        break;
      default:
        response.status(500).json({
          statusCode: 500,
          message: 'Internal server error',
        });
        break;
    }
  }
}

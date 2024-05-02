import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common";
import { Request, Response } from 'express';
import { ValidationException } from "../exception/validation.exception";

@Catch(ValidationException)
export class ValidationExceptionFilter implements ExceptionFilter {

  catch(exception: ValidationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    response
      .status(HttpStatus.BAD_REQUEST)
      .json({
        statusCode: HttpStatus.BAD_REQUEST,
        success: false,
        message: 'There were some errors with your data.',
        data: {
          errors: exception.messages
        }
      });
  }
}

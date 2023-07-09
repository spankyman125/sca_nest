//src/prisma-client-exception.filter.ts

import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';

import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const errorHttpMap = {
      P2002: {
        status: HttpStatus.CONFLICT,
        message: 'Unique constraint violation',
      },
      P2003: {
        status: HttpStatus.CONFLICT,
        message: 'Foreign key constraint violation',
      },
      P2004: {
        status: HttpStatus.CONFLICT,
        message: 'Constraint violation',
      },
      P2011: {
        status: HttpStatus.BAD_REQUEST,
        message: 'Null constraint violation',
      },
      P2012: {
        status: HttpStatus.BAD_REQUEST,
        message: 'Missing required field',
      },
      P2015: {
        status: HttpStatus.BAD_REQUEST,
        message: 'Related field not found',
      },
      P2017: {
        status: HttpStatus.CONFLICT,
        message: 'Records are not connected',
      },
      P2025: {
        status: HttpStatus.NOT_FOUND,
        message: 'Object not found',
      },
    };
    if (errorHttpMap[exception.code]) {
      const statusCode = errorHttpMap[exception.code].status;
      const message = errorHttpMap[exception.code].message;
      response.status(statusCode).json({
        statusCode,
        message,
      });
    } else super.catch(exception, host);
  }
}

import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { winstonLoggerOptions } from './logger.config';

@Module({
  imports: [WinstonModule.forRoot(winstonLoggerOptions)],
  exports: [WinstonModule],
})
export class LoggerModule {}

import {
  Inject,
  Injectable,
  LoggerService,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
  ) {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
      ],
    });
  }
  async onModuleInit() {
    this.$on('query', (e) => {
      this.logger.log(
        `[Prisma Query] ${e.query} ${e.params} +${e.duration}ms`,
      );
    });
    this.$on('info', (e) => {
      this.logger.log(`[Prisma Info] ${e.message}`);
    });
    this.$on('warn', (e) => {
      this.logger.warn(`[Prisma Warn] ${e.message}`);
    });
    this.$on('error', (e) => {
      this.logger.error(`[Prisma Error] ${e.message}`);
    });
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
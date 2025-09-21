import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { globalConfig } from './config';
import { globalConfigSchema } from './config.schema';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: globalConfig,
      expandVariables: true,
      validationSchema: globalConfigSchema,
      validate: (env) => globalConfigSchema.parse(env),
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}

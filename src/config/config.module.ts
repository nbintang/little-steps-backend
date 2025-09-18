import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { appConfig, authConfig, cloudinaryConfig, mailConfig } from './config';
import { globalConfigSchema } from './config.schema';

@Module({
  imports: [NestConfigModule.forRoot({
    isGlobal: true,
    load: [appConfig, authConfig, mailConfig, cloudinaryConfig],
    expandVariables: true,
    validationSchema: globalConfigSchema,
    validate: (env) => globalConfigSchema.parse(env),
  })],
  providers: [ConfigService],
  exports: [ConfigService]
})
export class ConfigModule { }

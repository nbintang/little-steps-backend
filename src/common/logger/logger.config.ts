import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import * as path from 'path';
const logDir = 'logs';
const isServerless = process.env.NODE_ENV === 'production';

const transports: winston.transport[] = [
    new winston.transports.Console({
        level: 'debug',
        format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.colorize({ all: true }),
            winston.format.splat(),
            winston.format.errors({ stack: true }),
            nestWinstonModuleUtilities.format.nestLike('MyApp', {
                prettyPrint: true,
                colors: true,
            }),
        ),
    }),
];

if (!isServerless) {
    transports.push(
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
            format: winston.format.combine(
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                winston.format.errors({ stack: true }),
                winston.format.json(),
            ),
        }),
        new winston.transports.File({
            filename: path.join(logDir, 'combined.log'),
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                winston.format.errors({ stack: true }),
                winston.format.json(),
            ),
        }),
    );
}

export const winstonLoggerOptions: WinstonModuleOptions = {
    transports,
};
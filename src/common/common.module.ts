import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { ValidationService } from './validation.service';
import { APP_FILTER } from '@nestjs/core';
import { ErrorFilter } from './error.filter';
import { CommonController } from './common.controller';

@Global()
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        })
    ],
    providers: [
        PrismaService,
        ValidationService,
        {
            provide: APP_FILTER,
            useClass: ErrorFilter
        }
    ],
    exports: [
        PrismaService,
        ValidationService,
    ],
    controllers: [
        CommonController,
    ]
})
export class CommonModule { }

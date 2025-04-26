import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        super();
    }

    async onModuleInit(): Promise<void> {
        await this.$connect();
        console.log("Database connected");
    }

    async onModuleDestroy(): Promise<void> {
        await this.$disconnect();
        console.log("Database disconnected");
    }
}

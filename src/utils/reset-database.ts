// src/database/database-seed.service.ts
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class DatabaseSeedService implements OnModuleInit {
    private readonly logger = new Logger(DatabaseSeedService.name);

    constructor(
        @InjectConnection() private readonly connection: Connection,
    ) { }

    async onModuleInit() {
        this.logger.warn('Dropping entire database and reseeding products…');
        await this.connection.dropDatabase();
        // then re-insert products via ProductSeedService or here directly
    }
}

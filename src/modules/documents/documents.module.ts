import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentFile } from './document.entity';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentFile])],
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}

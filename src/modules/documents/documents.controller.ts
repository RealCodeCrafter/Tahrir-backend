import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { memoryStorage } from 'multer';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { DocumentsService } from './documents.service';

@ApiTags('documents')
@ApiBearerAuth()
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 20 * 1024 * 1024 },
    }),
  )
  upload(@CurrentUser() user: User, @UploadedFile() file: Express.Multer.File) {
    return this.documentsService.create(user, file);
  }

  @Get()
  mine(@CurrentUser() user: User) {
    return this.documentsService.mine(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.documentsService.findOne(user.id, id);
  }

  @Get(':id/download')
  async download(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const doc = await this.documentsService.findOne(user.id, id);
    res.setHeader('Content-Type', doc.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${doc.originalName}"`);
    this.documentsService.stream(doc).pipe(res);
  }

  @Delete(':id')
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.documentsService.remove(user.id, id);
  }
}

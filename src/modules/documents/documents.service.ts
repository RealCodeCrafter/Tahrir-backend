import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createReadStream, existsSync, mkdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import { Repository } from 'typeorm';
import { DocumentStatus } from '../../common/enums';
import { User } from '../users/user.entity';
import { DocumentFile } from './document.entity';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(DocumentFile)
    private readonly repo: Repository<DocumentFile>,
  ) {}

  private uploadDir() {
    const dir = join(process.cwd(), process.env.UPLOAD_DIR || 'uploads');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    return dir;
  }

  async create(user: User, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Fayl yuborilmadi');
    }
    const extractedText =
      file.mimetype.startsWith('text/') ? file.buffer.toString('utf8') : null;
    const storedName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    const dest = join(this.uploadDir(), storedName);
    const { writeFileSync } = await import('fs');
    writeFileSync(dest, file.buffer);

    return this.repo.save(
      this.repo.create({
        originalName: file.originalname,
        storedName,
        mimeType: file.mimetype,
        size: file.size,
        status: extractedText ? DocumentStatus.READY : DocumentStatus.UPLOADED,
        extractedText,
        user,
      }),
    );
  }

  mine(userId: string) {
    return this.repo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(userId: string, id: string, admin = false) {
    const item = await this.repo.findOne({
      where: admin ? { id } : { id, user: { id: userId } },
      relations: ['user'],
    });
    if (!item) throw new NotFoundException('Hujjat topilmadi');
    return item;
  }

  filePath(doc: DocumentFile) {
    return join(this.uploadDir(), doc.storedName);
  }

  stream(doc: DocumentFile) {
    const path = this.filePath(doc);
    if (!existsSync(path)) throw new NotFoundException('Fayl topilmadi');
    return createReadStream(path);
  }

  async remove(userId: string, id: string) {
    const item = await this.findOne(userId, id);
    const path = this.filePath(item);
    if (existsSync(path)) unlinkSync(path);
    await this.repo.remove(item);
    return { deleted: true };
  }
}

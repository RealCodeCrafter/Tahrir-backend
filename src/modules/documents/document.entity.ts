import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DocumentStatus } from '../../common/enums';
import { User } from '../users/user.entity';

@Entity('documents')
export class DocumentFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  originalName: string;

  @Column()
  storedName: string;

  @Column()
  mimeType: string;

  @Column({ type: 'int' })
  size: number;

  @Column({ type: 'enum', enum: DocumentStatus, default: DocumentStatus.UPLOADED })
  status: DocumentStatus;

  @Column({ type: 'text', nullable: true })
  extractedText: string | null;

  @ManyToOne(() => User, (user) => user.documents, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}

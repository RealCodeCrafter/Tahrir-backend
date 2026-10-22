import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { CheckHistory } from './check-history.entity';
import { analyzeText, checkUzbek, countWords, rewriteText } from './uzbek-checker';

@Injectable()
export class GrammarService {
  constructor(
    @InjectRepository(CheckHistory)
    private readonly history: Repository<CheckHistory>,
  ) {}

  async check(text: string, user?: User | null) {
    const issues = checkUzbek(text);
    const words = countWords(text);
    const chars = text.replace(/\n/g, '').length;
    if (user) {
      await this.history.save(
        this.history.create({ text, issues, words, chars, user }),
      );
    }
    return { text, issues, words, chars };
  }

  rewrite(text: string, style: string) {
    return { original: text, style, result: rewriteText(text, style) };
  }

  analyze(text: string) {
    return analyzeText(text);
  }

  historyFor(userId: string) {
    return this.history.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }
}

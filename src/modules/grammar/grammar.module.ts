import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckHistory } from './check-history.entity';
import { GrammarController } from './grammar.controller';
import { GrammarService } from './grammar.service';

@Module({
  imports: [TypeOrmModule.forFeature([CheckHistory])],
  controllers: [GrammarController],
  providers: [GrammarService],
})
export class GrammarModule {}

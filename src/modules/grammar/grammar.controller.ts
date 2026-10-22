import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { OptionalJwtGuard } from '../../common/guards/optional-jwt.guard';
import { User } from '../users/user.entity';
import { CheckTextDto, RewriteTextDto } from './dto/grammar.dto';
import { GrammarService } from './grammar.service';

@ApiTags('grammar')
@Controller()
export class GrammarController {
  constructor(private readonly grammarService: GrammarService) {}

  @Public()
  @UseGuards(OptionalJwtGuard)
  @Post('grammar/check')
  check(@Body() dto: CheckTextDto, @CurrentUser() user?: User) {
    return this.grammarService.check(dto.text, user ?? null);
  }

  @Public()
  @Post('rewrite')
  rewrite(@Body() dto: RewriteTextDto) {
    return this.grammarService.rewrite(dto.text, dto.style);
  }

  @Public()
  @Post('analysis')
  analyze(@Body() dto: CheckTextDto) {
    return this.grammarService.analyze(dto.text);
  }

  @ApiBearerAuth()
  @Get('grammar/history')
  history(@CurrentUser() user: User) {
    return this.grammarService.historyFor(user.id);
  }
}

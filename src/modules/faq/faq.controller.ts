import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';
import { CreateFaqItemDto, CreateFaqTopicDto, FaqQueryDto } from './dto/faq.dto';
import { FaqService } from './faq.service';

@ApiTags('faq')
@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Public()
  @Get('topics')
  topics() {
    return this.faqService.listTopics();
  }

  @Public()
  @Get()
  items(@Query() query: FaqQueryDto) {
    return this.faqService.findItems(query);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Post('topics')
  createTopic(@Body() dto: CreateFaqTopicDto) {
    return this.faqService.createTopic(dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Post()
  createItem(@Body() dto: CreateFaqItemDto) {
    return this.faqService.createItem(dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.faqService.removeItem(id);
  }
}

import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';
import { SubscribeDto } from './dto/subscribe.dto';
import { NewsletterService } from './newsletter.service';

@ApiTags('newsletter')
@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Public()
  @Post()
  subscribe(@Body() dto: SubscribeDto) {
    return this.newsletterService.subscribe(dto.email);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Get()
  findAll(@Query() query: PaginationDto) {
    return this.newsletterService.findAll(query);
  }
}

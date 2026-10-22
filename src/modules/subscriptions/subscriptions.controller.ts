import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { CreateSubscriptionDto } from './dto/subscribe.dto';
import { SubscriptionsService } from './subscriptions.service';

@ApiTags('subscriptions')
@ApiBearerAuth()
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(user, dto);
  }

  @Get('me')
  mine(@CurrentUser() user: User) {
    return this.subscriptionsService.mine(user.id);
  }

  @Patch(':id/cancel')
  cancel(@CurrentUser() user: User, @Param('id') id: string) {
    return this.subscriptionsService.cancel(user.id, id);
  }
}

import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';
import { BlogService } from './blog.service';
import {
  BlogQueryDto,
  CreateBlogCategoryDto,
  CreateBlogPostDto,
  UpdateBlogPostDto,
} from './dto/blog.dto';

@ApiTags('blog')
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Public()
  @Get('categories')
  categories() {
    return this.blogService.listCategories();
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Post('categories')
  createCategory(@Body() dto: CreateBlogCategoryDto) {
    return this.blogService.createCategory(dto);
  }

  @Public()
  @Get()
  findAll(@Query() query: BlogQueryDto) {
    return this.blogService.findPosts(query, true);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogService.findPost(id);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Post()
  create(@Body() dto: CreateBlogPostDto) {
    return this.blogService.createPost(dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBlogPostDto) {
    return this.blogService.updatePost(id, dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blogService.removePost(id);
  }
}

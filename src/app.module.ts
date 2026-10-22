import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { SeedModule } from './database/seed.module';
import { AuthModule } from './modules/auth/auth.module';
import { BlogModule } from './modules/blog/blog.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { FaqModule } from './modules/faq/faq.module';
import { GrammarModule } from './modules/grammar/grammar.module';
import { HealthModule } from './modules/health/health.module';
import { NewsModule } from './modules/news/news.module';
import { NewsletterModule } from './modules/newsletter/newsletter.module';
import { PlansModule } from './modules/plans/plans.module';
import { ProductsModule } from './modules/products/products.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: Number(config.get('DB_PORT', 5432)),
        username: config.get<string>('DB_USERNAME', 'tahrir'),
        password: config.get<string>('DB_PASSWORD', 'tahrir'),
        database: config.get<string>('DB_NAME', 'tahrir'),
        autoLoadEntities: true,
        synchronize: config.get('NODE_ENV') !== 'production',
      }),
    }),
    AuthModule,
    UsersModule,
    ContactsModule,
    NewsletterModule,
    PlansModule,
    SubscriptionsModule,
    BlogModule,
    NewsModule,
    FaqModule,
    DocumentsModule,
    GrammarModule,
    CategoriesModule,
    ProductsModule,
    HealthModule,
    SeedModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ],
})
export class AppModule {}

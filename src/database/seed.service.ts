import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { FaqTab, UserRole } from '../common/enums';
import { BlogCategory } from '../modules/blog/blog-category.entity';
import { BlogPost } from '../modules/blog/blog-post.entity';
import { Category } from '../modules/categories/category.entity';
import { FaqItem } from '../modules/faq/faq-item.entity';
import { FaqTopic } from '../modules/faq/faq-topic.entity';
import { News } from '../modules/news/news.entity';
import { Plan } from '../modules/plans/plan.entity';
import { Product } from '../modules/products/product.entity';
import { User } from '../modules/users/user.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Plan) private readonly plans: Repository<Plan>,
    @InjectRepository(BlogCategory) private readonly blogCats: Repository<BlogCategory>,
    @InjectRepository(BlogPost) private readonly posts: Repository<BlogPost>,
    @InjectRepository(News) private readonly news: Repository<News>,
    @InjectRepository(FaqTopic) private readonly faqTopics: Repository<FaqTopic>,
    @InjectRepository(FaqItem) private readonly faqItems: Repository<FaqItem>,
    @InjectRepository(Category) private readonly categories: Repository<Category>,
    @InjectRepository(Product) private readonly products: Repository<Product>,
  ) {}

  async onModuleInit() {
    if (this.config.get('SEED_ON_START') !== 'true') return;
    if ((await this.users.count()) > 0) {
      this.logger.log('Seed o\'tkazib yuborildi — ma\'lumotlar allaqachon bor');
      return;
    }
    await this.seed();
    this.logger.log('Boshlang\'ich ma\'lumotlar yozildi');
  }

  private async seed() {
    const password = await bcrypt.hash('Admin1234!', 10);
    const userPassword = await bcrypt.hash('User1234!', 10);

    await this.users.save([
      this.users.create({
        fullName: 'Tahrir Admin',
        email: 'admin@tahrir.uz',
        password,
        role: UserRole.ADMIN,
      }),
      this.users.create({
        fullName: 'Demo User',
        email: 'user@tahrir.uz',
        password: userPassword,
        role: UserRole.USER,
      }),
    ]);

    const planRows = await this.plans.save([
      this.plans.create({
        name: 'Free',
        slug: 'free',
        description: 'Boshlash uchun',
        monthlyPrice: 0,
        yearlyPrice: 0,
        features: ['5 ta hujjat / oy', 'Asosiy tekshirish', 'AI tavsiyalar', 'PDF / DOCX yuklash'],
        cta: 'Boshlash',
        documentsPerMonth: 5,
        sortOrder: 1,
      }),
      this.plans.create({
        name: 'Plus',
        slug: 'plus',
        description: 'Kundalik ish uchun',
        monthlyPrice: 9,
        yearlyPrice: 86,
        features: ['200 ta hujjat / oy', 'Barcha AI imkoniyatlari', 'Hujjat bilan chat', 'Eksport va shablonlar'],
        cta: 'Tanlash',
        isPrimary: true,
        documentsPerMonth: 200,
        sortOrder: 2,
      }),
      this.plans.create({
        name: 'Pro',
        slug: 'pro',
        description: "Ko'proq imkoniyatlar",
        monthlyPrice: 19,
        yearlyPrice: 182,
        features: ['1 000 ta hujjat / oy', 'Kengaytirilgan AI', 'XLSX tahlili', "Ustuvor qo'llab-quvvatlash"],
        cta: 'Tanlash',
        isPrimary: true,
        isPopular: true,
        documentsPerMonth: 1000,
        sortOrder: 3,
      }),
      this.plans.create({
        name: 'Team',
        slug: 'team',
        description: 'Jamoangiz uchun',
        monthlyPrice: 49,
        yearlyPrice: 470,
        features: ['5 ta foydalanuvchi', 'B2B funksiyalar', 'Admin panel', 'Maxsus integratsiya'],
        cta: "Biz bilan bog'lanish",
        documentsPerMonth: 5000,
        maxUsers: 5,
        sortOrder: 4,
      }),
    ]);
    void planRows;

    const cats = await this.blogCats.save(
      ['Writing tips', 'Grammar', 'AI tools', 'Documents'].map((name, i) =>
        this.blogCats.create({
          name,
          slug: name.toLowerCase().replace(/\s+/g, '-'),
          sortOrder: i + 1,
        }),
      ),
    );

    const byName = Object.fromEntries(cats.map((c) => [c.name, c]));
    await this.posts.save([
      this.posts.create({
        title: 'A better way to edit long documents',
        slug: 'better-way-to-edit-long-documents',
        excerpt: 'Tools, techniques, and workflows to make editing faster, easier, and more effective.',
        content: 'Long-form editing needs structure, search, and consistent grammar checks. Tahrir helps you keep a long document readable.',
        category: byName.Documents,
        cover: 'peach',
        icon: 'search',
        readMinutes: 8,
        isFeatured: true,
        publishedAt: new Date('2024-03-12'),
      }),
      this.posts.create({
        title: 'How to write a professional email',
        slug: 'how-to-write-a-professional-email',
        excerpt: 'A simple guide to writing clear, polite, and effective emails for work, with helpful templates.',
        content: 'Start with a clear subject, state the request early, and close with a next step.',
        category: byName['Writing tips'],
        cover: 'peach',
        icon: 'mail',
        readMinutes: 6,
        publishedAt: new Date('2024-03-05'),
      }),
      this.posts.create({
        title: 'What AI can—and cannot—fix',
        slug: 'what-ai-can-and-cannot-fix',
        excerpt: 'A balanced look at where AI helps with writing, and where human judgment still matters.',
        content: 'AI is strong at spelling and rhythm, but intent and facts still need a human editor.',
        category: byName['AI tools'],
        cover: 'dark',
        icon: 'bulb',
        readMinutes: 7,
        publishedAt: new Date('2024-02-28'),
      }),
    ]);

    await this.news.save([
      this.news.create({
        title: 'Tahrir Pro tarifida yangi tahlil vositalari',
        slug: 'tahrir-pro-tahlil',
        excerpt: 'Grammatika, ravshanlik va ohang bo\'yicha kengaytirilgan hisobot.',
        content: 'Pro foydalanuvchilar endi hujjat bo\'yicha batafsil tahlil olishadi.',
        isPublished: true,
        publishedAt: new Date(),
      }),
      this.news.create({
        title: 'O\'zbek tili qoidalari yangilandi',
        slug: 'ozbek-tili-qoidalari',
        excerpt: 'Imlo tekshiruviga qo\'shimcha so\'z o\'zaklari qo\'shildi.',
        content: 'Tahrir checker endi ko\'proq keng tarqalgan xatolarni topadi.',
        isPublished: true,
        publishedAt: new Date(),
      }),
    ]);

    const topics = await this.faqTopics.save([
      { slug: 'start', label: 'Boshlash', icon: 'book', sortOrder: 1 },
      { slug: 'tools', label: 'Yozuv vositalari', icon: 'pen', sortOrder: 2 },
      { slug: 'docs', label: 'Hujjatlar va yuklash', icon: 'doc', sortOrder: 3 },
      { slug: 'billing', label: "Tariflar va to'lov", icon: 'card', sortOrder: 4 },
      { slug: 'account', label: 'Hisob va maxfiylik', icon: 'user', sortOrder: 5 },
    ].map((t) => this.faqTopics.create(t)));

    const topicBySlug = Object.fromEntries(topics.map((t) => [t.slug, t]));
    await this.faqItems.save([
      {
        question: "Tahrir qaysi tillarni qo'llab-quvvatlaydi?",
        answer: "Tahrir o'zbek tilida aniqroq yozishga yordam beradi: imlo, grammatika va uslub bo'yicha tavsiyalar beradi.",
        tab: FaqTab.POPULAR,
        topic: topicBySlug.start,
        sortOrder: 1,
        tag: "O'zbek tili",
      },
      {
        question: 'Hujjatni qanday yuklayman?',
        answer: "«Hujjat yuklash» tugmasini bosing va .docx yoki .txt faylni tanlang.",
        tab: FaqTab.POPULAR,
        topic: topicBySlug.docs,
        sortOrder: 2,
      },
      {
        question: "Tahrirni bepul sinab ko'rsam bo'ladimi?",
        answer: "Ha. Ro'yxatdan o'tgach, bepul tarifda asosiy imlo va grammatika tekshiruvidan foydalanishingiz mumkin.",
        tab: FaqTab.POPULAR,
        topic: topicBySlug.billing,
        sortOrder: 3,
      },
      {
        question: "Obunamni qanday boshqaraman?",
        answer: "Hisob sozlamalarida «Tariflar va to'lov» bo'limiga o'ting.",
        tab: FaqTab.POPULAR,
        topic: topicBySlug.billing,
        sortOrder: 4,
      },
      {
        question: "Yozganlarim maxfiy va xavfsizmi?",
        answer: "Matnlaringiz shifrlangan holda saqlanadi va uchinchi shaxslarga berilmaydi.",
        tab: FaqTab.POPULAR,
        topic: topicBySlug.account,
        sortOrder: 5,
      },
      {
        question: "Brauzer kengaytmasini qanday o'rnataman?",
        answer: "Brauzeringizning kengaytmalar do'konidan Tahrir'ni qidiring va o'rnating.",
        tab: FaqTab.GUIDES,
        topic: topicBySlug.tools,
        sortOrder: 1,
      },
      {
        question: 'Tahrirni Word bilan qanday ishlataman?',
        answer: "Hujjatingizni .docx formatida yuklang va tuzatilgan matnni qayta yuklab oling.",
        tab: FaqTab.GUIDES,
        topic: topicBySlug.docs,
        sortOrder: 2,
      },
      {
        question: 'Hujjat yuklanmayapti, nima qilish kerak?',
        answer: 'Fayl hajmi va formatini tekshiring. Muammo davom etsa, sahifani yangilang.',
        tab: FaqTab.TROUBLE,
        topic: topicBySlug.docs,
        sortOrder: 1,
      },
      {
        question: "Hisobimga kira olmayapman.",
        answer: "Kirish sahifasidagi parolni tiklash yo'lidan foydalaning.",
        tab: FaqTab.TROUBLE,
        topic: topicBySlug.account,
        sortOrder: 2,
      },
      {
        question: 'TAHRIR qaysi tilda ishlaydi?',
        answer: "TAHRIR o'zbek tilidagi matnlar uchun yaratilgan.",
        tab: FaqTab.POPULAR,
        topic: topicBySlug.start,
        tag: "O'zbek tili",
        sortOrder: 0,
      },
    ].map((i) => this.faqItems.create(i)));

    const cat = await this.categories.save(
      this.categories.create({
        name: 'Yozuv vositalari',
        slug: 'yozuv-vositalari',
        description: 'Tahrir mahsulotlari',
      }),
    );
    await this.products.save(
      this.products.create({
        name: 'Tahrir Pro',
        description: 'O\'zbek tili uchun to\'liq yozuv maydoni',
        price: 19,
        sku: 'TAHRIR-PRO',
        category: cat,
      }),
    );
  }
}

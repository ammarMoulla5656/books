import { PrismaClient } from '@prisma/client';
import { PrismaSQLite } from '@prisma/adapter-sqlite';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

const db = new Database('prisma/dev.db');
const adapter = new PrismaSQLite(db);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 بدء إضافة البيانات الأساسية...');

  // إنشاء التصنيفات
  const categories = [
    {
      name: 'Jurisprudence',
      arabicName: 'الفقه',
      description: 'كتب الفقه والأحكام الشرعية',
      icon: '⚖️',
      order: 1,
    },
    {
      name: 'Beliefs',
      arabicName: 'العقائد',
      description: 'كتب العقيدة والتوحيد',
      icon: '🕌',
      order: 2,
    },
    {
      name: 'Ethics',
      arabicName: 'الأخلاق',
      description: 'كتب الأخلاق والآداب الإسلامية',
      icon: '💫',
      order: 3,
    },
    {
      name: 'History',
      arabicName: 'التاريخ',
      description: 'كتب التاريخ الإسلامي',
      icon: '📜',
      order: 4,
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { arabicName: category.arabicName },
      update: {},
      create: category,
    });
  }

  console.log('✅ تم إنشاء التصنيفات');

  // إنشاء حساب Admin
  const hashedPassword = await bcrypt.hash('Admin@123456', 10);
  
  await prisma.admin.upsert({
    where: { email: 'admin@islamic-library.com' },
    update: {},
    create: {
      email: 'admin@islamic-library.com',
      password: hashedPassword,
      name: 'المسؤول',
    },
  });

  console.log('✅ تم إنشاء حساب Admin');
  console.log('   البريد: admin@islamic-library.com');
  console.log('   كلمة المرور: Admin@123456');
}

main()
  .catch((e) => {
    console.error('❌ خطأ:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    db.close();
  });

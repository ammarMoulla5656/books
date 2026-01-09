import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://admin@localhost:5432/islamic_library',
  max: 20,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 إضافة البيانات الأساسية...\n');

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

  console.log('📚 إنشاء التصنيفات...');
  for (const category of categories) {
    try {
      const existing = await prisma.category.findFirst({
        where: { arabicName: category.arabicName }
      });
      
      if (!existing) {
        await prisma.category.create({ data: category });
        console.log(`   ✅ ${category.arabicName}`);
      } else {
        console.log(`   ⏭️  ${category.arabicName} (موجود)`);
      }
    } catch (e) {
      console.log(`   ❌ خطأ في ${category.arabicName}: ${e.message}`);
    }
  }

  // إنشاء حساب Admin
  console.log('\n👤 إنشاء حساب Admin...');
  try {
    const existing = await prisma.admin.findFirst({
      where: { email: 'admin@islamic-library.com' }
    });

    if (!existing) {
      const hashedPassword = await bcrypt.hash('Admin@123456', 10);
      await prisma.admin.create({
        data: {
          email: 'admin@islamic-library.com',
          password: hashedPassword,
          name: 'المسؤول',
        }
      });
      console.log('   ✅ تم إنشاء حساب Admin');
      console.log('   📧 البريد: admin@islamic-library.com');
      console.log('   🔑 كلمة المرور: Admin@123456');
    } else {
      console.log('   ⏭️  حساب Admin موجود مسبقاً');
    }
  } catch (e) {
    console.log('   ❌ خطأ في إنشاء Admin:', e.message);
  }

  console.log('\n🎉 تم الانتهاء!\n');
}

main()
  .catch((e) => {
    console.error('❌ خطأ:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

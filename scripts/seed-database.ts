import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

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
    const existing = await prisma.category.findFirst({
      where: { arabicName: category.arabicName }
    });
    
    if (!existing) {
      await prisma.category.create({ data: category });
      console.log(`   ✅ تم إنشاء: ${category.arabicName}`);
    } else {
      console.log(`   ⏭️  موجود مسبقاً: ${category.arabicName}`);
    }
  }

  // إنشاء حساب Admin
  const existingAdmin = await prisma.admin.findFirst({
    where: { email: 'admin@islamic-library.com' }
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('Admin@123456', 10);
    await prisma.admin.create({
      data: {
        email: 'admin@islamic-library.com',
        password: hashedPassword,
        name: 'المسؤول',
      }
    });
    console.log('\n✅ تم إنشاء حساب Admin:');
    console.log('   📧 البريد: admin@islamic-library.com');
    console.log('   🔑 كلمة المرور: Admin@123456');
  } else {
    console.log('\n⏭️  حساب Admin موجود مسبقاً');
  }

  console.log('\n🎉 تم إكمال إضافة البيانات!');
}

main()
  .catch((e) => {
    console.error('❌ خطأ:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

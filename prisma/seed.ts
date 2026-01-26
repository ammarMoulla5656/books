import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Generate secure password from environment or create random one
function getInitialAdminPassword(): string {
  const envPassword = process.env.ADMIN_INITIAL_PASSWORD;

  if (envPassword && envPassword.length >= 12) {
    console.log('🔒 Using password from ADMIN_INITIAL_PASSWORD environment variable');
    return envPassword;
  }

  // Generate cryptographically secure random password
  const length = 24;
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
  let password = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(charset.length);
    password += charset[randomIndex];
  }

  console.warn('\n⚠️  ═══════════════════════════════════════════════════════════');
  console.warn('⚠️  WARNING: ADMIN_INITIAL_PASSWORD not set in .env');
  console.warn('⚠️  Generated random password (SAVE THIS IMMEDIATELY):');
  console.warn(`⚠️  \n    ${password}\n`);
  console.warn(`⚠️  Add to .env file as:`);
  console.warn(`⚠️  ADMIN_INITIAL_PASSWORD="${password}"`);
  console.warn('⚠️  ═══════════════════════════════════════════════════════════\n');

  return password;
}

async function main() {
  console.log('🌱 بدء إضافة البيانات الأساسية...\n');

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
      where: { arabicName: category.arabicName },
    });

    if (!existing) {
      await prisma.category.create({
        data: category,
      });
    }
  }

  console.log('✅ تم إنشاء التصنيفات\n');

  // إنشاء حساب Admin
  const initialPassword = getInitialAdminPassword();
  const hashedPassword = await bcrypt.hash(initialPassword, 12);

  await prisma.admin.upsert({
    where: { email: 'admin@islamic-library.com' },
    update: {},
    create: {
      email: 'admin@islamic-library.com',
      password: hashedPassword,
      name: 'المسؤول',
      mustChangePassword: true, // Force password change on first login
    },
  });

  console.log('✅ تم إنشاء حساب Admin');
  console.log('   📧 البريد: admin@islamic-library.com');
  console.log('   🔐 يجب تغيير كلمة المرور عند أول تسجيل دخول\n');
}

main()
  .catch((e) => {
    console.error('❌ خطأ:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

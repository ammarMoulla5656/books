import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { requireAdminAuth, logUnauthorizedAccess } from '@/lib/admin-auth';
import { getOrGenerateAdminPassword } from '@/lib/password-generator';

export async function POST(request: NextRequest) {
  // ✅ SECURITY: Require admin authentication
  const authCheck = await requireAdminAuth();
  if (authCheck.error) {
    logUnauthorizedAccess('/api/admin/seed', request, 'No valid admin session');
    return authCheck.error;
  }

  try {
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

    const createdCategories = [];
    for (const category of categories) {
      const existing = await prisma.category.findFirst({
        where: { arabicName: category.arabicName }
      });
      
      if (!existing) {
        const created = await prisma.category.create({ data: category });
        createdCategories.push(created);
      }
    }

    // إنشاء حساب Admin
    const existingAdmin = await prisma.admin.findFirst({
      where: { email: 'admin@islamic-library.com' }
    });

    let adminCreated = false;
    let generatedPassword: string | null = null;

    if (!existingAdmin) {
      // Get password from environment or generate secure random password
      const initialPassword = getOrGenerateAdminPassword();
      const hashedPassword = await bcrypt.hash(initialPassword, 12);

      await prisma.admin.create({
        data: {
          email: 'admin@islamic-library.com',
          password: hashedPassword,
          name: 'المسؤول',
        }
      });

      adminCreated = true;

      // Only include password in response if it was generated (not from env)
      if (!process.env.ADMIN_INITIAL_PASSWORD) {
        generatedPassword = initialPassword;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'تم إضافة البيانات الأساسية بنجاح',
      data: {
        categoriesCreated: createdCategories.length,
        adminCreated,
        ...(generatedPassword && {
          warning: 'كلمة مرور مؤقتة تم توليدها',
          tempPassword: generatedPassword,
          note: 'سيتم طلب تغيير كلمة المرور عند أول تسجيل دخول'
        }),
      }
    });

  } catch (error: any) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

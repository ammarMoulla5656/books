import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST() {
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
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('Admin@123456', 10);
      await prisma.admin.create({
        data: {
          email: 'admin@islamic-library.com',
          password: hashedPassword,
          name: 'المسؤول',
        }
      });
      adminCreated = true;
    }

    return NextResponse.json({
      success: true,
      message: 'تم إضافة البيانات الأساسية بنجاح',
      data: {
        categoriesCreated: createdCategories.length,
        adminCreated,
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

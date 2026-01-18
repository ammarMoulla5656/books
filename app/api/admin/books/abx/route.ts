import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { parseABXFile, abxToBookData } from '@/lib/abx-parser';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/admin/books/abx
 * Upload ABX file directly without AI processing
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.endsWith('.abx')) {
      return NextResponse.json(
        { error: 'Invalid file type. Only .abx files are supported.' },
        { status: 400 }
      );
    }

    // Read file content
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const xmlContent = buffer.toString('utf-8');

    // Parse ABX file
    const abxBook = parseABXFile(xmlContent);

    if (!abxBook.metadata.bookName) {
      return NextResponse.json(
        { error: 'Invalid ABX file: Missing book name' },
        { status: 400 }
      );
    }

    // Convert to database format
    const bookData = abxToBookData(abxBook);

    // Save ABX file to uploads directory
    const uploadsDir = join(process.cwd(), 'uploads', 'abx');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const fileName = `${Date.now()}_${file.name}`;
    const filePath = join(uploadsDir, fileName);
    await writeFile(filePath, buffer);

    // Check if category exists, create if not
    let category = await prisma.category.findFirst({
      where: { id: bookData.categoryId }
    });

    if (!category) {
      // Create category if it doesn't exist
      const categoryNames: Record<string, { name: string; arabicName: string; description: string; icon: string }> = {
        fiqh: { name: 'Jurisprudence', arabicName: 'الفقه', description: 'Islamic Jurisprudence and Legal Rulings', icon: '⚖️' },
        aqeedah: { name: 'Creed', arabicName: 'العقائد', description: 'Islamic Beliefs and Theology', icon: '✨' },
        usul: { name: 'Principles of Jurisprudence', arabicName: 'أصول الفقه', description: 'Fundamentals of Islamic Legal Theory', icon: '📐' },
        tafsir: { name: 'Exegesis', arabicName: 'التفسير', description: 'Quranic Interpretation and Commentary', icon: '📖' },
        hadith: { name: 'Hadith', arabicName: 'الحديث', description: 'Prophetic Traditions and Narrations', icon: '📜' },
        history: { name: 'History', arabicName: 'التاريخ', description: 'Islamic History and Biography', icon: '🏛️' },
        ethics: { name: 'Ethics', arabicName: 'الأخلاق', description: 'Islamic Ethics and Morality', icon: '💎' },
        dua: { name: 'Supplications', arabicName: 'الأدعية', description: 'Prayers and Supplications', icon: '🤲' },
      };

      const catInfo = categoryNames[bookData.categoryId] || categoryNames.fiqh;

      category = await prisma.category.create({
        data: {
          id: bookData.categoryId,
          name: catInfo.name,
          arabicName: catInfo.arabicName,
          description: catInfo.description,
          icon: catInfo.icon,
        }
      });
    }

    // Create book in database with TOC-based chapters and individual pages
    // Each chapter's pages are already associated in the parser
    const chaptersData = bookData.chapters.map((chapter: any) => ({
      title: chapter.title,
      order: chapter.order,
      sections: {
        create: chapter.pages && chapter.pages.length > 0
          ? chapter.pages.map((page: any) => ({
              title: `صفحة ${page.pageNumber}`,
              content: page.content,
              order: page.pageNumber,
              pageCount: 1,
            }))
          : [
              {
                title: chapter.title,
                content: chapter.content,
                order: 1,
                pageCount: 1,
              }
            ]
      }
    }));

    const book = await prisma.book.create({
      data: {
        title: bookData.title,
        author: bookData.author || 'Unknown Author',
        categoryId: category.id,
        pageCount: bookData.totalPages,
        order: 0,
        chapters: {
          create: chaptersData
        }
      },
      include: {
        category: true,
        chapters: {
          include: {
            sections: true
          }
        },
      }
    });

    // Note: Metadata storage would require a JSON field in schema
    // For now, the full page data is in the section content

    return NextResponse.json({
      success: true,
      message: 'تم رفع الكتاب بنجاح',
      book: {
        id: book.id,
        title: book.title,
        author: book.author,
        category: category.arabicName,
        pages: bookData.totalPages,
        chapters: book.chapters.length,
      }
    });

  } catch (error) {
    console.error('ABX upload error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process ABX file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

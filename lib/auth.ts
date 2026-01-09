import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Ensure default admin exists
async function ensureDefaultAdmin() {
  try {
    const defaultAdminEmail = 'admin@islamic-library.com';
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: defaultAdminEmail },
    });

    if (!existingAdmin) {
      const hashedPassword = await hashPassword('Admin@123456');
      await prisma.admin.create({
        data: {
          email: defaultAdminEmail,
          password: hashedPassword,
          name: 'Admin',
        },
      });
      console.log('✅ Created default admin account');
    }
  } catch (error) {
    console.error('Error ensuring default admin:', error);
  }
}

// Initialize default admin
ensureDefaultAdmin();

export async function createAdmin(email: string, password: string, name?: string) {
  const hashedPassword = await hashPassword(password);

  const admin = await prisma.admin.create({
    data: {
      email,
      password: hashedPassword,
      name: name || 'Admin',
    },
  });

  return admin;
}

export async function verifyAdmin(email: string, password: string) {
  const admin = await prisma.admin.findUnique({
    where: { email },
  });

  if (!admin) {
    return null;
  }

  const isValid = await verifyPassword(password, admin.password);

  if (!isValid) {
    return null;
  }

  // Return admin without password
  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
  };
}

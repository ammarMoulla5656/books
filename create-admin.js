// Create admin user in database
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const password = 'Admin@123456';
  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.admin.deleteMany({
    where: { email: 'admin@islamic-library.com' }
  });

  const admin = await prisma.admin.create({
    data: {
      email: 'admin@islamic-library.com',
      password: hashedPassword,
      name: 'المسؤول',
      mustChangePassword: false,
    },
  });

  console.log('✅ Admin created successfully');
  console.log('Email:', admin.email);
  console.log('Password:', password);
  console.log('\nYou can now login at: http://localhost:3000/admin/login');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

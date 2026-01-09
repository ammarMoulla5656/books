import { createAdmin } from '../lib/auth';

async function main() {
  const email = process.argv[2] || 'admin@islamic-library.com';
  const password = process.argv[3] || 'Admin@123456';
  const name = process.argv[4] || 'Admin';

  console.log('Creating admin...');
  console.log('Email:', email);

  try {
    const admin = await createAdmin(email, password, name);
    console.log('✅ Admin created successfully!');
    console.log('ID:', admin.id);
    console.log('Email:', admin.email);
    console.log('Name:', admin.name);
    console.log('\nYou can now login with these credentials.');
  } catch (error: any) {
    if (error.code === 'P2002') {
      console.error('❌ Error: Admin with this email already exists!');
    } else {
      console.error('❌ Error creating admin:', error.message);
    }
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

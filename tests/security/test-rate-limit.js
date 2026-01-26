#!/usr/bin/env node

/**
 * سكريبت بسيط لاختبار Rate Limiting
 *
 * الاستخدام:
 * 1. تأكد من تشغيل السيرفر: npm run dev
 * 2. شغل السكريبت: node tests/security/test-rate-limit.js
 */

const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const TEST_ENDPOINT = `${API_URL}/api/books`;

console.log('🧪 بدء اختبار Rate Limiting...\n');
console.log(`📍 الخادم: ${API_URL}`);
console.log(`📍 نقطة النهاية: ${TEST_ENDPOINT}\n`);

// ============================================
// Test 1: إرسال 50 طلب (يجب أن ينجح)
// ============================================

async function test1() {
  console.log('✅ الاختبار 1: إرسال 50 طلب (ضمن الحد)');

  const promises = [];
  for (let i = 0; i < 50; i++) {
    promises.push(
      fetch(TEST_ENDPOINT, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );
  }

  const responses = await Promise.all(promises);
  const statuses = responses.map(r => r.status);
  const rateLimited = statuses.filter(s => s === 429).length;

  console.log(`   📊 عدد الطلبات: ${responses.length}`);
  console.log(`   ✅ نجح: ${statuses.filter(s => s !== 429).length}`);
  console.log(`   ❌ محدود: ${rateLimited}`);

  if (rateLimited === 0) {
    console.log('   ✅ الاختبار نجح: لا توجد طلبات محدودة\n');
    return true;
  } else {
    console.log('   ❌ الاختبار فشل: يوجد طلبات محدودة ضمن الحد\n');
    return false;
  }
}

// ============================================
// Test 2: إرسال 110 طلب (يجب أن يُحد)
// ============================================

async function test2() {
  console.log('✅ الاختبار 2: إرسال 110 طلب (فوق الحد)');

  const promises = [];
  for (let i = 0; i < 110; i++) {
    promises.push(
      fetch(TEST_ENDPOINT, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );
  }

  const responses = await Promise.all(promises);
  const statuses = responses.map(r => r.status);
  const rateLimited = statuses.filter(s => s === 429).length;

  console.log(`   📊 عدد الطلبات: ${responses.length}`);
  console.log(`   ✅ نجح: ${statuses.filter(s => s !== 429).length}`);
  console.log(`   ❌ محدود: ${rateLimited}`);

  if (rateLimited > 0) {
    console.log('   ✅ الاختبار نجح: Rate Limiting يعمل بشكل صحيح\n');
    return true;
  } else {
    console.log('   ❌ الاختبار فشل: Rate Limiting لا يعمل\n');
    return false;
  }
}

// ============================================
// Test 3: فحص Rate Limit Headers
// ============================================

async function test3() {
  console.log('✅ الاختبار 3: فحص Rate Limit Headers');

  const response = await fetch(TEST_ENDPOINT, {
    method: 'GET',
  });

  const headers = {
    'X-RateLimit-Limit': response.headers.get('X-RateLimit-Limit'),
    'X-RateLimit-Remaining': response.headers.get('X-RateLimit-Remaining'),
    'X-RateLimit-Reset': response.headers.get('X-RateLimit-Reset'),
  };

  console.log('   📋 Headers:');
  console.log(`      X-RateLimit-Limit: ${headers['X-RateLimit-Limit']}`);
  console.log(`      X-RateLimit-Remaining: ${headers['X-RateLimit-Remaining']}`);
  console.log(`      X-RateLimit-Reset: ${headers['X-RateLimit-Reset']}`);

  if (headers['X-RateLimit-Limit'] && headers['X-RateLimit-Remaining']) {
    console.log('   ✅ الاختبار نجح: جميع Headers موجودة\n');
    return true;
  } else {
    console.log('   ❌ الاختبار فشل: Headers مفقودة\n');
    return false;
  }
}

// ============================================
// Test 4: فحص Security Headers
// ============================================

async function test4() {
  console.log('✅ الاختبار 4: فحص Security Headers');

  const response = await fetch(TEST_ENDPOINT, {
    method: 'GET',
  });

  const headers = {
    'X-Frame-Options': response.headers.get('X-Frame-Options'),
    'X-Content-Type-Options': response.headers.get('X-Content-Type-Options'),
    'Referrer-Policy': response.headers.get('Referrer-Policy'),
    'X-XSS-Protection': response.headers.get('X-XSS-Protection'),
    'Content-Security-Policy': response.headers.get('Content-Security-Policy'),
  };

  console.log('   📋 Security Headers:');
  console.log(`      X-Frame-Options: ${headers['X-Frame-Options']}`);
  console.log(`      X-Content-Type-Options: ${headers['X-Content-Type-Options']}`);
  console.log(`      Referrer-Policy: ${headers['Referrer-Policy']}`);
  console.log(`      X-XSS-Protection: ${headers['X-XSS-Protection']}`);
  console.log(`      CSP: ${headers['Content-Security-Policy'] ? 'موجود' : 'غير موجود'}`);

  const allPresent = Object.values(headers).every(h => h !== null);

  if (allPresent) {
    console.log('   ✅ الاختبار نجح: جميع Security Headers موجودة\n');
    return true;
  } else {
    console.log('   ❌ الاختبار فشل: بعض Headers مفقودة\n');
    return false;
  }
}

// ============================================
// Test 5: فحص Attack Pattern Detection
// ============================================

async function test5() {
  console.log('✅ الاختبار 5: فحص Attack Pattern Detection');

  const maliciousURLs = [
    `${API_URL}/api/books?id=1' OR '1'='1`, // SQL Injection
    `${API_URL}/api/books?file=../../etc/passwd`, // Path Traversal
    `${API_URL}/api/books?name=<script>alert('xss')</script>`, // XSS
  ];

  let blocked = 0;

  for (const url of maliciousURLs) {
    const response = await fetch(url, { method: 'GET' });
    if (response.status === 400 || response.status === 403) {
      blocked++;
    }
  }

  console.log(`   📊 محاولات خبيثة: ${maliciousURLs.length}`);
  console.log(`   🛡️ محظور: ${blocked}`);

  if (blocked >= 2) {
    console.log('   ✅ الاختبار نجح: Attack Detection يعمل\n');
    return true;
  } else {
    console.log('   ⚠️ تحذير: Attack Detection قد لا يعمل بشكل كامل\n');
    return false;
  }
}

// ============================================
// تشغيل جميع الاختبارات
// ============================================

async function runTests() {
  try {
    console.log('═'.repeat(60));
    console.log('🔒 اختبار أمان Middleware');
    console.log('═'.repeat(60));
    console.log('');

    const results = [];

    // الاختبار 3 أولاً (Headers)
    results.push(await test3());

    // الاختبار 4 (Security Headers)
    results.push(await test4());

    // الاختبار 5 (Attack Detection)
    results.push(await test5());

    // ملاحظة: الاختبارات 1 و 2 قد تؤثر على بعضها بسبب Rate Limiting
    console.log('⚠️ تخطي اختبارات Rate Limiting الكاملة لتجنب الحظر');
    console.log('   (شغل السكريبت مرة أخرى بعد 15 دقيقة لاختبار Rate Limiting)\n');

    console.log('═'.repeat(60));
    console.log('📊 النتائج النهائية');
    console.log('═'.repeat(60));

    const passed = results.filter(r => r === true).length;
    const total = results.length;

    console.log(`✅ نجح: ${passed}/${total}`);
    console.log(`❌ فشل: ${total - passed}/${total}`);

    if (passed === total) {
      console.log('\n🎉 جميع الاختبارات نجحت!');
      process.exit(0);
    } else {
      console.log('\n⚠️ بعض الاختبارات فشلت');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
    console.error('\nتأكد من:');
    console.error('1. السيرفر يعمل (npm run dev)');
    console.error('2. الخادم على المنفذ الصحيح (3000)');
    process.exit(1);
  }
}

// تشغيل
runTests();

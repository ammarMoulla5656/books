#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
اختبار الحمل - المكتبة الإسلامية
Load Testing Script for Islamic Library

يحاكي عدد من المستخدمين يزورون الموقع ويقرؤون الكتب
"""

import requests
import time
import random
import threading
from datetime import datetime
from collections import defaultdict

# ====================================
# الإعدادات - يمكنك تعديلها
# ====================================

BASE_URL = "http://localhost:3000"
NUM_USERS = 100  # عدد المستخدمين المتزامنين (غيّر هذا الرقم)
DURATION_SECONDS = 60  # مدة الاختبار بالثواني
DELAY_BETWEEN_REQUESTS = 0.5  # التأخير بين الطلبات (ثانية)

# ====================================
# إحصائيات الاختبار
# ====================================

stats = {
    'total_requests': 0,
    'successful_requests': 0,
    'failed_requests': 0,
    'response_times': [],
    'errors': defaultdict(int),
    'endpoints': defaultdict(int)
}

stats_lock = threading.Lock()


def log(message, level="INFO"):
    """طباعة رسالة مع الوقت"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] [{level}] {message}")


def update_stats(success, response_time, endpoint, error=None):
    """تحديث الإحصائيات"""
    with stats_lock:
        stats['total_requests'] += 1
        stats['endpoints'][endpoint] += 1

        if success:
            stats['successful_requests'] += 1
            stats['response_times'].append(response_time)
        else:
            stats['failed_requests'] += 1
            if error:
                stats['errors'][str(error)] += 1


def make_request(method, endpoint, **kwargs):
    """إرسال طلب HTTP وتسجيل النتيجة"""
    url = f"{BASE_URL}{endpoint}"

    try:
        start_time = time.time()

        if method == "GET":
            response = requests.get(url, timeout=10, **kwargs)
        elif method == "POST":
            response = requests.post(url, timeout=10, **kwargs)
        else:
            response = requests.request(method, url, timeout=10, **kwargs)

        response_time = time.time() - start_time

        success = response.status_code < 400
        update_stats(success, response_time, endpoint)

        return response, response_time

    except Exception as e:
        response_time = time.time() - start_time
        update_stats(False, response_time, endpoint, error=e)
        return None, response_time


def simulate_user(user_id, duration):
    """
    محاكاة مستخدم واحد يتصفح الموقع
    """
    end_time = time.time() + duration
    log(f"🙋 المستخدم {user_id} بدأ التصفح", "USER")

    while time.time() < end_time:
        try:
            # 1. زيارة الصفحة الرئيسية
            log(f"👤 المستخدم {user_id}: زيارة الصفحة الرئيسية", "ACTION")
            response, resp_time = make_request("GET", "/")
            log(f"   ⏱️  وقت الاستجابة: {resp_time:.2f}s", "TIME")

            time.sleep(DELAY_BETWEEN_REQUESTS)

            # 2. جلب قائمة الكتب
            log(f"👤 المستخدم {user_id}: جلب قائمة الكتب", "ACTION")
            response, resp_time = make_request("GET", "/api/books")
            log(f"   ⏱️  وقت الاستجابة: {resp_time:.2f}s", "TIME")

            if response and response.status_code == 200:
                try:
                    books = response.json()

                    if books:
                        # 3. اختيار كتاب عشوائي
                        book = random.choice(books)
                        book_id = book.get('id')

                        time.sleep(DELAY_BETWEEN_REQUESTS)

                        log(f"👤 المستخدم {user_id}: قراءة كتاب {book.get('title', 'Unknown')}", "ACTION")
                        response, resp_time = make_request("GET", f"/books/{book_id}")
                        log(f"   ⏱️  وقت الاستجابة: {resp_time:.2f}s", "TIME")

                        time.sleep(DELAY_BETWEEN_REQUESTS)

                        # 4. جلب تفاصيل الكتاب من API
                        log(f"👤 المستخدم {user_id}: جلب تفاصيل الكتاب", "ACTION")
                        response, resp_time = make_request("GET", f"/api/books/{book_id}")
                        log(f"   ⏱️  وقت الاستجابة: {resp_time:.2f}s", "TIME")
                    else:
                        log(f"⚠️  المستخدم {user_id}: لا توجد كتب", "WARNING")

                except Exception as e:
                    log(f"❌ المستخدم {user_id}: خطأ في معالجة البيانات - {e}", "ERROR")

            time.sleep(DELAY_BETWEEN_REQUESTS)

            # 5. جلب التصنيفات
            log(f"👤 المستخدم {user_id}: جلب التصنيفات", "ACTION")
            response, resp_time = make_request("GET", "/api/categories")
            log(f"   ⏱️  وقت الاستجابة: {resp_time:.2f}s", "TIME")

            # انتظار عشوائي بين 1-3 ثواني
            wait_time = random.uniform(1, 3)
            time.sleep(wait_time)

        except Exception as e:
            log(f"❌ المستخدم {user_id}: خطأ - {e}", "ERROR")

    log(f"👋 المستخدم {user_id} أنهى التصفح", "USER")


def print_stats():
    """طباعة الإحصائيات النهائية"""
    print("\n" + "="*70)
    print("📊 إحصائيات اختبار الحمل")
    print("="*70)

    print(f"\n📈 إجمالي الطلبات:")
    print(f"   • الإجمالي:     {stats['total_requests']}")
    print(f"   • ناجحة:        {stats['successful_requests']} ({stats['successful_requests']/max(stats['total_requests'], 1)*100:.1f}%)")
    print(f"   • فاشلة:        {stats['failed_requests']} ({stats['failed_requests']/max(stats['total_requests'], 1)*100:.1f}%)")

    if stats['response_times']:
        print(f"\n⏱️  أوقات الاستجابة:")
        print(f"   • المتوسط:      {sum(stats['response_times'])/len(stats['response_times']):.3f}s")
        print(f"   • الأقل:        {min(stats['response_times']):.3f}s")
        print(f"   • الأكثر:       {max(stats['response_times']):.3f}s")

    print(f"\n🔗 الطلبات حسب المسار:")
    for endpoint, count in sorted(stats['endpoints'].items(), key=lambda x: x[1], reverse=True):
        print(f"   • {endpoint}: {count}")

    if stats['errors']:
        print(f"\n❌ الأخطاء:")
        for error, count in stats['errors'].items():
            print(f"   • {error}: {count}")

    print("\n" + "="*70)


def run_load_test():
    """تشغيل اختبار الحمل"""
    print("="*70)
    print("🚀 اختبار الحمل - المكتبة الإسلامية")
    print("="*70)
    print(f"\n⚙️  الإعدادات:")
    print(f"   • عدد المستخدمين:         {NUM_USERS}")
    print(f"   • مدة الاختبار:           {DURATION_SECONDS} ثانية")
    print(f"   • التأخير بين الطلبات:    {DELAY_BETWEEN_REQUESTS} ثانية")
    print(f"   • رابط الموقع:            {BASE_URL}")
    print("\n" + "="*70)

    # التحقق من الاتصال بالموقع
    log("🔍 التحقق من الاتصال بالموقع...")
    try:
        response = requests.get(BASE_URL, timeout=5)
        log(f"✅ الموقع متاح - الحالة: {response.status_code}", "SUCCESS")
    except Exception as e:
        log(f"❌ لا يمكن الاتصال بالموقع: {e}", "ERROR")
        log("⚠️  تأكد من أن الموقع يعمل على http://localhost:3000", "WARNING")
        return

    # بدء الاختبار
    log(f"\n🎯 بدء اختبار الحمل مع {NUM_USERS} مستخدم...\n", "START")

    start_time = time.time()
    threads = []

    # إنشاء threads للمستخدمين
    for i in range(NUM_USERS):
        thread = threading.Thread(target=simulate_user, args=(i+1, DURATION_SECONDS))
        thread.start()
        threads.append(thread)
        time.sleep(0.1)  # تأخير بسيط بين بدء كل مستخدم

    # انتظار انتهاء جميع المستخدمين
    for thread in threads:
        thread.join()

    total_time = time.time() - start_time

    log(f"\n✅ انتهى الاختبار في {total_time:.2f} ثانية", "SUCCESS")

    # طباعة الإحصائيات
    print_stats()

    # حساب معدل الطلبات
    requests_per_second = stats['total_requests'] / total_time
    print(f"\n📊 معدل الطلبات: {requests_per_second:.2f} طلب/ثانية")

    # تقييم الأداء
    print(f"\n🎯 تقييم الأداء:")
    avg_response_time = sum(stats['response_times'])/len(stats['response_times']) if stats['response_times'] else 0
    success_rate = stats['successful_requests']/max(stats['total_requests'], 1)*100

    if success_rate >= 95 and avg_response_time < 1:
        print(f"   ✅ ممتاز! الموقع يتحمل {NUM_USERS} مستخدم بدون مشاكل")
    elif success_rate >= 90 and avg_response_time < 2:
        print(f"   ✔️  جيد! الموقع يعمل بشكل مقبول مع {NUM_USERS} مستخدم")
    elif success_rate >= 80:
        print(f"   ⚠️  متوسط! قد تحتاج لتحسين الأداء")
    else:
        print(f"   ❌ ضعيف! الموقع يواجه صعوبة مع هذا الحمل")

    print("\n" + "="*70)


if __name__ == "__main__":
    try:
        run_load_test()
    except KeyboardInterrupt:
        print("\n\n⏹️  تم إيقاف الاختبار بواسطة المستخدم")
        print_stats()
    except Exception as e:
        print(f"\n❌ خطأ: {e}")

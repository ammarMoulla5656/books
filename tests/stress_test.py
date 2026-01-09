#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
اختبار ضغط شديد - المكتبة الإسلامية
Stress Testing - Maximum Load - No Limits!

⚠️ تحذير: هذا الاختبار يضغط على المعالج والموقع بأقصى قوة!
"""

import requests
import time
import random
import threading
from datetime import datetime
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed
import warnings
import sys

# تعطيل كل التحذيرات والقيود
warnings.filterwarnings('ignore')
try:
    import urllib3
    urllib3.disable_warnings()
except:
    pass

# ====================================
# الإعدادات - غيّر كما تشاء!
# ====================================

BASE_URL = "http://localhost:3000"
NUM_USERS = 1000  # عدد المستخدمين - غيّره لأي رقم تريد!
DURATION_SECONDS = 60  # مدة الاختبار
DELAY_BETWEEN_REQUESTS = 0  # بدون تأخير = أقصى سرعة!
MAX_WORKERS = 1000  # عدد الخيوط المتزامنة
REQUEST_TIMEOUT = 5  # مهلة الطلب (ثواني)

# ====================================
# إحصائيات الاختبار
# ====================================

stats = {
    'total_requests': 0,
    'successful_requests': 0,
    'failed_requests': 0,
    'response_times': [],
    'errors': defaultdict(int),
    'endpoints': defaultdict(int),
    'timeouts': 0,
    'connection_errors': 0
}

stats_lock = threading.Lock()
start_time = None


def log(message, level="INFO"):
    """طباعة رسالة مع الوقت"""
    timestamp = datetime.now().strftime("%H:%M:%S.%f")[:-3]
    print(f"[{timestamp}] [{level}] {message}", flush=True)


def update_stats(success, response_time, endpoint, error=None):
    """تحديث الإحصائيات بسرعة"""
    with stats_lock:
        stats['total_requests'] += 1
        stats['endpoints'][endpoint] += 1

        if success:
            stats['successful_requests'] += 1
            stats['response_times'].append(response_time)
        else:
            stats['failed_requests'] += 1
            if error:
                error_str = str(type(error).__name__)
                stats['errors'][error_str] += 1

                if 'timeout' in error_str.lower():
                    stats['timeouts'] += 1
                elif 'connection' in error_str.lower():
                    stats['connection_errors'] += 1


def make_request(method, endpoint, silent=False):
    """إرسال طلب HTTP - سريع وبدون قيود"""
    url = f"{BASE_URL}{endpoint}"

    req_start = time.time()

    try:
        if method == "GET":
            response = requests.get(
                url,
                timeout=REQUEST_TIMEOUT,
                allow_redirects=True,
                verify=False  # إزالة التحقق من SSL للسرعة
            )
        else:
            response = requests.request(
                method,
                url,
                timeout=REQUEST_TIMEOUT,
                allow_redirects=True,
                verify=False
            )

        response_time = time.time() - req_start
        success = 200 <= response.status_code < 400

        update_stats(success, response_time, endpoint)

        return response, response_time, success

    except Exception as e:
        response_time = time.time() - req_start
        update_stats(False, response_time, endpoint, error=e)
        return None, response_time, False


def simulate_user_aggressive(user_id, end_time):
    """
    مستخدم عدواني - يرسل طلبات بأقصى سرعة!
    """
    request_count = 0

    while time.time() < end_time:
        try:
            # 1. الصفحة الرئيسية
            response, rt, success = make_request("GET", "/", silent=True)
            request_count += 1

            if DELAY_BETWEEN_REQUESTS > 0:
                time.sleep(DELAY_BETWEEN_REQUESTS)

            # 2. قائمة الكتب
            response, rt, success = make_request("GET", "/api/books", silent=True)
            request_count += 1

            if response and success:
                try:
                    books = response.json()
                    if books:
                        # 3. كتاب عشوائي
                        book = random.choice(books)
                        book_id = book.get('id')

                        if DELAY_BETWEEN_REQUESTS > 0:
                            time.sleep(DELAY_BETWEEN_REQUESTS)

                        # صفحة الكتاب
                        make_request("GET", f"/books/{book_id}", silent=True)
                        request_count += 1

                        if DELAY_BETWEEN_REQUESTS > 0:
                            time.sleep(DELAY_BETWEEN_REQUESTS)

                        # API الكتاب
                        make_request("GET", f"/api/books/{book_id}", silent=True)
                        request_count += 1
                except:
                    pass

            if DELAY_BETWEEN_REQUESTS > 0:
                time.sleep(DELAY_BETWEEN_REQUESTS)

            # 4. التصنيفات
            make_request("GET", "/api/categories", silent=True)
            request_count += 1

        except Exception as e:
            pass

    return request_count


def print_live_stats():
    """طباعة الإحصائيات الحية"""
    elapsed = time.time() - start_time

    with stats_lock:
        total = stats['total_requests']
        success = stats['successful_requests']
        failed = stats['failed_requests']

        if total > 0:
            success_rate = (success / total) * 100
            rps = total / max(elapsed, 0.1)

            avg_time = sum(stats['response_times']) / len(stats['response_times']) if stats['response_times'] else 0

            print(f"\r⚡ الوقت: {elapsed:.0f}s | الطلبات: {total} | نجح: {success} ({success_rate:.1f}%) | فشل: {failed} | السرعة: {rps:.1f} req/s | الوسط: {avg_time:.3f}s", end='', flush=True)


def print_final_stats():
    """طباعة الإحصائيات النهائية"""
    print("\n\n" + "="*80)
    print("🔥 نتائج اختبار الضغط الشديد")
    print("="*80)

    elapsed = time.time() - start_time

    print(f"\n⏱️  المدة الإجمالية: {elapsed:.2f} ثانية")
    print(f"👥 عدد المستخدمين: {NUM_USERS}")

    print(f"\n📊 الطلبات:")
    total = stats['total_requests']
    success = stats['successful_requests']
    failed = stats['failed_requests']

    print(f"   • الإجمالي:           {total:,}")
    print(f"   • ناجحة:              {success:,} ({success/max(total,1)*100:.1f}%)")
    print(f"   • فاشلة:              {failed:,} ({failed/max(total,1)*100:.1f}%)")
    print(f"   • انتهت المهلة:       {stats['timeouts']:,}")
    print(f"   • أخطاء الاتصال:      {stats['connection_errors']:,}")

    if stats['response_times']:
        times = stats['response_times']
        times.sort()

        print(f"\n⚡ أوقات الاستجابة:")
        print(f"   • المتوسط:            {sum(times)/len(times):.3f}s")
        print(f"   • الأقل:              {min(times):.3f}s")
        print(f"   • الأكثر:             {max(times):.3f}s")
        print(f"   • 50% (الوسيط):       {times[len(times)//2]:.3f}s")
        print(f"   • 90%:                {times[int(len(times)*0.9)]:.3f}s")
        print(f"   • 95%:                {times[int(len(times)*0.95)]:.3f}s")
        print(f"   • 99%:                {times[int(len(times)*0.99)]:.3f}s")

    rps = total / max(elapsed, 0.1)
    print(f"\n🚀 الأداء:")
    print(f"   • معدل الطلبات:       {rps:.2f} طلب/ثانية")
    print(f"   • الإنتاجية:          {rps * 60:.0f} طلب/دقيقة")

    print(f"\n🔗 توزيع الطلبات:")
    for endpoint, count in sorted(stats['endpoints'].items(), key=lambda x: x[1], reverse=True):
        percent = (count / max(total, 1)) * 100
        print(f"   • {endpoint:30s} {count:6,} ({percent:5.1f}%)")

    if stats['errors']:
        print(f"\n❌ الأخطاء:")
        for error, count in sorted(stats['errors'].items(), key=lambda x: x[1], reverse=True):
            print(f"   • {error:30s} {count:6,}")

    # التقييم
    print(f"\n🎯 التقييم:")
    avg_time = sum(stats['response_times'])/len(stats['response_times']) if stats['response_times'] else 999
    success_rate = (success / max(total, 1)) * 100

    if success_rate >= 99 and avg_time < 0.5:
        print(f"   🏆 ممتاز جداً! الموقع قوي ويتحمل {NUM_USERS} مستخدم بسهولة")
    elif success_rate >= 95 and avg_time < 1:
        print(f"   ✅ ممتاز! الموقع يتحمل الحمل بشكل رائع")
    elif success_rate >= 90 and avg_time < 2:
        print(f"   ✔️  جيد! الموقع يعمل بشكل مقبول")
    elif success_rate >= 80:
        print(f"   ⚠️  متوسط! قد تحتاج لتحسينات")
    elif success_rate >= 50:
        print(f"   ⚠️  ضعيف! الموقع يواجه صعوبة")
    else:
        print(f"   ❌ الموقع لا يتحمل هذا الحمل")

    print("\n" + "="*80 + "\n")


def run_stress_test():
    """تشغيل اختبار الضغط الشديد"""
    global start_time

    print("="*80)
    print("🔥 اختبار الضغط الشديد - بدون حدود!")
    print("="*80)
    print(f"\n⚙️  الإعدادات:")
    print(f"   • عدد المستخدمين:        {NUM_USERS:,}")
    print(f"   • مدة الاختبار:          {DURATION_SECONDS} ثانية")
    print(f"   • التأخير:               {DELAY_BETWEEN_REQUESTS}s (بدون تأخير = أقصى سرعة!)")
    print(f"   • عدد الخيوط:            {MAX_WORKERS:,}")
    print(f"   • رابط الموقع:           {BASE_URL}")

    # التحقق من الاتصال
    log("\n🔍 التحقق من الاتصال...")
    try:
        response = requests.get(BASE_URL, timeout=5, verify=False)
        log(f"✅ الموقع متاح - الحالة: {response.status_code}", "SUCCESS")
    except Exception as e:
        log(f"❌ خطأ في الاتصال: {e}", "ERROR")
        log("⚠️  تأكد من تشغيل الموقع على http://localhost:3000", "WARNING")
        return

    print("\n" + "="*80)
    log(f"🚀 بدء الهجوم مع {NUM_USERS:,} مستخدم في نفس اللحظة!", "START")
    log("⚡ جميع المستخدمين سيبدأون فوراً - أقصى ضغط!", "START")
    print("="*80 + "\n")

    start_time = time.time()
    end_time = start_time + DURATION_SECONDS

    # استخدام ThreadPoolExecutor للسرعة القصوى
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        # إطلاق جميع المستخدمين دفعة واحدة!
        futures = []
        log(f"🔥 إطلاق {NUM_USERS:,} مستخدم...", "LAUNCH")

        for i in range(NUM_USERS):
            future = executor.submit(simulate_user_aggressive, i+1, end_time)
            futures.append(future)

        log(f"✅ تم إطلاق {NUM_USERS:,} مستخدم!", "LAUNCH")
        log("⚡ الضغط الآن في أقصاه...\n", "ACTIVE")

        # طباعة الإحصائيات الحية
        last_update = time.time()
        while time.time() < end_time:
            if time.time() - last_update > 0.5:  # تحديث كل نصف ثانية
                print_live_stats()
                last_update = time.time()
            time.sleep(0.1)

        # انتظار انتهاء الجميع
        log("\n\n⏳ انتظار انتهاء المستخدمين...", "WAIT")
        completed = 0
        for future in as_completed(futures):
            completed += 1
            if completed % 100 == 0:
                print(f"\r✓ انتهى {completed}/{NUM_USERS} مستخدم...", end='', flush=True)

        print(f"\r✓ انتهى {NUM_USERS}/{NUM_USERS} مستخدم!     ")

    log(f"✅ اكتمل الاختبار!", "SUCCESS")

    # طباعة النتائج النهائية
    print_final_stats()


if __name__ == "__main__":
    try:
        # قراءة عدد المستخدمين من سطر الأوامر إن وُجد
        if len(sys.argv) > 1:
            try:
                NUM_USERS = int(sys.argv[1])
                print(f"\n✓ تم تعيين عدد المستخدمين إلى: {NUM_USERS:,}\n")
            except:
                print(f"\n⚠️  رقم غير صحيح، استخدام القيمة الافتراضية: {NUM_USERS}\n")

        run_stress_test()

    except KeyboardInterrupt:
        print("\n\n⏹️  تم إيقاف الاختبار!")
        print_final_stats()
    except Exception as e:
        print(f"\n\n❌ خطأ فادح: {e}")
        import traceback
        traceback.print_exc()

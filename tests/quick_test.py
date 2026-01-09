#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
اختبار سريع - المكتبة الإسلامية
Quick Load Test

طريقة استخدام بسيطة:
python quick_test.py 20

حيث 20 هو عدد المستخدمين
"""

import sys
import requests
import time
import random
import threading

# الإعدادات الافتراضية
BASE_URL = "http://localhost:3000"
NUM_USERS = 10 if len(sys.argv) < 2 else int(sys.argv[1])
DURATION = 30  # ثانية

# الإحصائيات
success_count = 0
fail_count = 0
response_times = []
lock = threading.Lock()


def test_user(user_id):
    """محاكاة مستخدم واحد"""
    global success_count, fail_count, response_times

    end_time = time.time() + DURATION
    local_success = 0
    local_fail = 0
    local_times = []

    while time.time() < end_time:
        try:
            # زيارة الصفحة الرئيسية
            start = time.time()
            r = requests.get(f"{BASE_URL}/", timeout=5)
            elapsed = time.time() - start

            if r.status_code < 400:
                local_success += 1
                local_times.append(elapsed)
            else:
                local_fail += 1

            time.sleep(0.3)

            # جلب الكتب
            start = time.time()
            r = requests.get(f"{BASE_URL}/api/books", timeout=5)
            elapsed = time.time() - start

            if r.status_code == 200:
                local_success += 1
                local_times.append(elapsed)

                # اختيار كتاب عشوائي
                books = r.json()
                if books:
                    book = random.choice(books)
                    time.sleep(0.3)

                    # قراءة الكتاب
                    start = time.time()
                    r = requests.get(f"{BASE_URL}/api/books/{book['id']}", timeout=5)
                    elapsed = time.time() - start

                    if r.status_code < 400:
                        local_success += 1
                        local_times.append(elapsed)
                    else:
                        local_fail += 1
            else:
                local_fail += 1

            time.sleep(random.uniform(1, 2))

        except:
            local_fail += 1

    # تحديث الإحصائيات العامة
    with lock:
        success_count += local_success
        fail_count += local_fail
        response_times.extend(local_times)


def main():
    """تشغيل الاختبار"""
    print("="*60)
    print("🧪 اختبار الحمل السريع - المكتبة الإسلامية")
    print("="*60)
    print(f"\n⚙️  عدد المستخدمين: {NUM_USERS}")
    print(f"⏱️  المدة: {DURATION} ثانية")
    print(f"🌐 الموقع: {BASE_URL}\n")

    # التحقق من الاتصال
    print("🔍 التحقق من الاتصال...")
    try:
        r = requests.get(BASE_URL, timeout=3)
        print(f"✅ الموقع متاح (HTTP {r.status_code})\n")
    except:
        print("❌ لا يمكن الاتصال بالموقع!")
        print("⚠️  تأكد من تشغيل: npm run dev\n")
        return

    # بدء الاختبار
    print(f"🚀 بدء الاختبار...\n")
    start_time = time.time()

    threads = []
    for i in range(NUM_USERS):
        t = threading.Thread(target=test_user, args=(i+1,))
        t.start()
        threads.append(t)

    for t in threads:
        t.join()

    total_time = time.time() - start_time

    # النتائج
    print("\n" + "="*60)
    print("📊 النتائج")
    print("="*60)

    total = success_count + fail_count
    print(f"\n📈 الطلبات:")
    print(f"   الإجمالي: {total}")
    print(f"   ناجحة:    {success_count} ({success_count/max(total,1)*100:.1f}%)")
    print(f"   فاشلة:    {fail_count} ({fail_count/max(total,1)*100:.1f}%)")

    if response_times:
        avg = sum(response_times) / len(response_times)
        print(f"\n⏱️  وقت الاستجابة:")
        print(f"   متوسط:  {avg:.3f}s")
        print(f"   أقل:    {min(response_times):.3f}s")
        print(f"   أكثر:   {max(response_times):.3f}s")

    rps = total / total_time
    print(f"\n📊 معدل الطلبات: {rps:.2f} طلب/ثانية")

    # التقييم
    success_rate = success_count/max(total,1)*100
    avg_time = sum(response_times)/len(response_times) if response_times else 999

    print(f"\n🎯 التقييم:")
    if success_rate >= 95 and avg_time < 1:
        print(f"   ✅ ممتاز! الموقع يتحمل {NUM_USERS} مستخدم بشكل ممتاز")
    elif success_rate >= 90 and avg_time < 2:
        print(f"   ✔️  جيد! الموقع يعمل بشكل جيد مع {NUM_USERS} مستخدم")
    elif success_rate >= 80:
        print(f"   ⚠️  متوسط! قد تحتاج لتحسين الأداء")
    else:
        print(f"   ❌ ضعيف! الموقع يواجه صعوبة مع هذا الحمل")

    print("\n" + "="*60 + "\n")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⏹️  تم إيقاف الاختبار\n")
    except Exception as e:
        print(f"\n❌ خطأ: {e}\n")

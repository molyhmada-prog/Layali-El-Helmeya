// ==========================================
// ملف إعدادات الربط بـ Supabase (js/supabase-config.js)
// ==========================================

const SUPABASE_URL = 'https://wzkdqonjnstkxleunlmw.supabase.co';

// ⚠️ ضعي مفتاح anon key الخاص بك هنا (الذي يبدأ بـ eyJ...) من لوحة Supabase -> Settings -> API
const SUPABASE_ANON_KEY = 'ضع_هنا_الـ_anon_key_الخاص_بالمشروع';

// إنشاء وتجهيز عميل Supabase
let supabaseClient = null;

if (typeof supabase !== 'undefined' && typeof supabase.createClient === 'function') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("تم تهيئة عميل Supabase بنجاح!");
} else {
    console.error("مكتبة Supabase CDN غير مثبتة في صفحة الـ HTML.");
}

// إتاحة العميل عالمياً لملفات JS الأخرى
window.supabaseClient = supabaseClient;
window.supabase = supabaseClient;

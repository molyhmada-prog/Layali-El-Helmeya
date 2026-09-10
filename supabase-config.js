// ==========================================
// ملف إعدادات الربط بـ Supabase (js/supabase-config.js)
// ==========================================

const SUPABASE_URL = 'https://wzkdqonjnstkxleunlmw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_y4L_ewNLCY6kTUeNsu2Pxw_ny-TLfRd';

// إنشاء وتجهيز عميل Supabase
let supabaseClient = null;

if (typeof supabase !== 'undefined' && supabase.createClient) {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    console.error("مكتبة Supabase CDN غير مثبتة في صفحة الـ HTML.");
}

// إتاحة العميل عالمياً لملفات JS الأخرى
window.supabaseClient = supabaseClient;
window.supabase = supabaseClient;
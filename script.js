const CONFIG = {
    phone: "0554241799",
    whatsapp: "9710554241799",
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    snapchat: "https://snapchat.com"
};

const translations = {
    ar: {
        brand: "ليالي الحلمية",
        navHome: "الرئيسية",
        navMenu: "المنيو",
        navAbout: "عن المطعم",
        navSpecials: "أشهر أطباقنا",
        navContact: "تواصل معنا",
        heroSubtitle: "أصالة الطعم المصري",
        heroTitle: "ليالي الحلمية",
        heroDesc: "الطعم الأصلي .. للأكل المصري",
        btnSeeMenu: "شوف المنيو",
        btnOrderNow: "اطلب الآن",
        aboutTitle: "حكاية ليالي الحلمية",
        aboutText: "نقدم لكم في 'ليالي الحلمية' أشهى المأكولات المصرية والأصلية المصنوعة بكل حب، بدءاً من الفطير المشلتت الفلاحي، والكريب، والبيتزا، وحتى الطواجن والوجبات المصرية الدسمة بأسلوب راقٍ وطعم أصيل في قلب رأس الخيمة.",
        specialsBadge: "أطباق مميزة",
        specialsTitle: "أشهر أطباقنا",
        contactTitle: "تواصل معنا وموقعنا",
        locationText: "رأس الخيمة - الإمارات العربية المتحدة",
        contactWA: "واتساب",
        contactCall: "اتصل بنا",
        contactMaps: "الموقع على الخريطة",
        cartTitle: "سلة الطلبات",
        cartEmptyTitle: "السلة فارغة حالياً",
        cartEmptySub: "أضف بعض الأطباق الشهية من المنيو للبدء في طلبك",
        cartItemsCount: "عدد المواد:",
        cartTotal: "الإجمالي:",
        btnSendWA: "إرسال الطلب عبر الواتساب",
        btnChooseLocation: "تحديد موقع التوصيل",
        namePlaceholder: "الاسم الكامل",
        phonePlaceholder: "رقم الهاتف",
        notesPlaceholder: "ملاحظات إضافية على الطلب...",
        catAll: "الكل",
        catSaltedPies: "فطير حادق",
        catSweetyPies: "فطير حلو",
        catPizza: "بيتزا",
        catCrepe: "كريب",
        catMeals: "وجبات وطواجن",
        menuSubtext: "استكشف أشهى المأكولات والمشروبات المصرية الأصيلة",
        searchPlaceholder: "ابحث عن وجبة...",
        locGetting: "جاري تحديد موقعك...",
        locSuccess: "تم تحديد الموقع بنجاح 🟢",
        locDenied: "تم رفض الوصول للموقع من الإعدادات.",
        locNotSupported: "متصفحك لا يدعم تحديد الموقع.",
        alertCartEmpty: "السلة فارغة! يرجى إضافة بعض الأطباق أولاً.",
        alertNamePhoneLoc: "يرجى كتابة الاسم، رقم الهاتف، وتحديد الموقع الجغرافي."
    },
    en: {
        brand: "Layali El Helmeya",
        navHome: "Home",
        navMenu: "Menu",
        navAbout: "About Us",
        navSpecials: "Famous Dishes",
        navContact: "Contact Us",
        heroSubtitle: "Authentic Egyptian Taste",
        heroTitle: "Layali El Helmeya",
        heroDesc: "Original Egyptian Cuisine in Ras Al Khaimah",
        btnSeeMenu: "View Menu",
        btnOrderNow: "Order Now",
        aboutTitle: "Our Story",
        aboutText: "At 'Layali El Helmeya', we serve authentic Egyptian delicacies crafted with passion — from traditional Feteer Meshaltet, Crepes, and Pizzas, to rich Casseroles and traditional Egyptian meals in the heart of Ras Al Khaimah.",
        specialsBadge: "Featured Items",
        specialsTitle: "Our Famous Dishes",
        contactTitle: "Contact Us & Location",
        locationText: "Ras Al Khaimah - United Arab Emirates",
        contactWA: "WhatsApp",
        contactCall: "Call Us",
        contactMaps: "Location Map",
        cartTitle: "Your Shopping Bag",
        cartEmptyTitle: "Your cart is empty",
        cartEmptySub: "Add delicious dishes from our menu to start your order",
        cartItemsCount: "Total Items:",
        cartTotal: "Total Amount:",
        btnSendWA: "Order via WhatsApp",
        btnChooseLocation: "Set Delivery Location",
        namePlaceholder: "Full Name",
        phonePlaceholder: "Phone Number",
        notesPlaceholder: "Additional Order Notes...",
        catAll: "All",
        catSaltedPies: "Salted Pies",
        catSweetyPies: "Sweet Pies",
        catPizza: "Pizza",
        catCrepe: "Crepe",
        catMeals: "Meals & Tawagen",
        menuSubtext: "Explore authentic and traditional Egyptian dishes",
        searchPlaceholder: "Search for a dish...",
        locGetting: "Fetching location...",
        locSuccess: "Location selected successfully 🟢",
        locDenied: "Location permission denied in settings.",
        locNotSupported: "Browser does not support geolocation.",
        alertCartEmpty: "Your cart is empty! Please add some dishes first.",
        alertNamePhoneLoc: "Please provide your name, phone number, and location."
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const savedLang = localStorage.getItem("pref_lang") || "ar";
    setLanguage(savedLang);
    bindContactLinks();
});

function toggleLanguage() {
    const currentLang = localStorage.getItem("pref_lang") || "ar";
    const newLang = currentLang === "ar" ? "en" : "ar";
    setLanguage(newLang);
}

function setLanguage(lang) {
    localStorage.setItem("pref_lang", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

    document.querySelectorAll("[data-i18n]").forEach(elem => {
        const key = elem.getAttribute("data-i18n");
        if (translations[lang] && translations[lang][key]) {
            elem.innerText = translations[lang][key];
        }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(elem => {
        const key = elem.getAttribute("data-i18n-placeholder");
        if (translations[lang] && translations[lang][key]) {
            elem.placeholder = translations[lang][key];
        }
    });

    const langBtn = document.getElementById("langBtn");
    if (langBtn) langBtn.innerText = lang === "ar" ? "EN" : "عربي";

    if (typeof updateCartUI === "function") updateCartUI();
    if (typeof loadMenuFromDB === "function") loadMenuFromDB();
}

function toggleMobileMenu() {
    const navLinks = document.getElementById("navLinks");
    if (navLinks) {
        if (navLinks.style.display === "flex") {
            navLinks.style.display = "none";
        } else {
            navLinks.style.display = "flex";
            navLinks.style.flexDirection = "column";
            navLinks.style.position = "absolute";
            navLinks.style.top = "100%";
            navLinks.style.left = "0";
            navLinks.style.width = "100%";
            navLinks.style.background = "#121212";
            navLinks.style.padding = "20px";
        }
    }
}

function bindContactLinks() {
    const wa = document.getElementById("whatsappBtnMain");
    const ph = document.getElementById("phoneBtnMain");
    if (wa) wa.href = `https://wa.me/${CONFIG.whatsapp}`;
    if (ph) ph.href = `tel:${CONFIG.phone}`;
}
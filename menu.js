// ==========================================
// ملف المنيو وقائمة الأطباق - مطعم ليالي الحلمية
// ==========================================

let menuItems = [];
let selectedSizes = {};
let lastKnownLang = '';

// تنظيف السلة القديمة التالفة تلقائياً
(function cleanOldCorruptedCart() {
    try {
        const keys = ["cart", "cart_items", "cartItems"];
        keys.forEach(k => {
            let data = JSON.parse(localStorage.getItem(k));
            if (data && Array.isArray(data)) {
                let cleanData = data.filter(item => item && (item.name || item.title || item.item_name) && (item.name !== "undefined"));
                localStorage.setItem(k, JSON.stringify(cleanData));
            }
        });
    } catch (e) { console.log("Cleaning cart status:", e); }
})();

document.addEventListener("DOMContentLoaded", () => {
    fetchMenuItemsFromSupabase();

    // 1. الاستماع لكلكة على أي زرار في الصفحة (عشان لو كان زرار اللغة)
    document.addEventListener('click', (e) => {
        setTimeout(() => {
            const currentLang = getActiveLanguage();
            if (currentLang !== lastKnownLang) {
                lastKnownLang = currentLang;
                renderMenu(menuItems);
            }
        }, 150);
    });

    // 2. مراقبة التغيير في عنصر <html> تلقائياً
    const observer = new MutationObserver(() => {
        const currentLang = getActiveLanguage();
        if (currentLang !== lastKnownLang) {
            lastKnownLang = currentLang;
            renderMenu(menuItems);
        }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'dir'] });

    // 3. فحص دوري كل نص ثانية للتأكد التام
    setInterval(() => {
        const currentLang = getActiveLanguage();
        if (currentLang !== lastKnownLang && menuItems.length > 0) {
            lastKnownLang = currentLang;
            renderMenu(menuItems);
        }
    }, 500);
});

// جلب البيانات من Supabase
async function fetchMenuItemsFromSupabase() {
    try {
        const client = window.supabaseClient || window.supabase;

        if (!client) {
            console.error("Supabase Client Not Found!");
            return;
        }

        const { data, error } = await client
            .from('menu_items')
            .select('*');

        if (error) {
            console.error("خطأ جلب البيانات:", error.message);
            return;
        }

        menuItems = data || [];
        lastKnownLang = getActiveLanguage();
        renderMenu(menuItems);
    } catch (err) {
        console.error("خطأ غير متوقع:", err);
    }
}

// دالة معرفة اللغة الحالية من كل المصادر المحتملة
function getActiveLanguage() {
    const htmlLang = document.documentElement.lang || '';
    const bodyLang = document.body ? (document.body.getAttribute('data-lang') || '') : '';
    const localLang = localStorage.getItem('site_lang') ||
        localStorage.getItem('lang') ||
        localStorage.getItem('selectedLanguage') || '';

    if (htmlLang.toLowerCase().includes('en') || bodyLang.toLowerCase().includes('en') || localLang.toLowerCase().includes('en')) {
        return 'en';
    }
    return 'ar';
}

// رسم كروت الأطباق ودعم الترجمة للغتين
function renderMenu(items) {
    const container = document.getElementById("featuredGrid") ||
        document.getElementById("menuGrid") ||
        document.querySelector(".menu-grid");

    if (!container) return;

    const currentLang = getActiveLanguage();
    const isEn = (currentLang === 'en');

    if (!items || items.length === 0) {
        container.innerHTML = `<p style="text-align:center; width:100%; grid-column:1/-1; padding:30px; font-size:18px; color:#aaa;">${isEn ? 'No items available.' : 'لا توجد أصناف حالياً.'}</p>`;
        return;
    }

    container.innerHTML = items.map(item => {
        // تحديد الاسم حسب اللغة
        let itemName = isEn
            ? (item.name_en || item.title_en || item.en_name || item.name || item.title || 'Layali Al Helmia Dish')
            : (item.name_ar || item.name || item.title || item.item_name || 'طبق ليالي الحلمية');

        // تحديد الوصف حسب اللغة
        let itemDesc = isEn
            ? (item.description_en || item.desc_en || item.en_description || item.description || item.desc || '')
            : (item.description_ar || item.description || item.desc || '');

        const itemImg = item.image_url || item.image || 'images/logo.jpg';

        const rawSizes = item.sizes;
        let parsedSizes = [];

        if (typeof rawSizes === 'string') {
            try { parsedSizes = JSON.parse(rawSizes); } catch (e) { parsedSizes = []; }
        } else if (Array.isArray(rawSizes)) {
            parsedSizes = rawSizes;
        }

        let sizesHTML = '';
        let displayPrice = item.price || 0;

        if (parsedSizes.length > 0) {
            displayPrice = parsedSizes[0].price;
            selectedSizes[item.id] = parsedSizes[0];

            sizesHTML = `
                <div style="margin: 12px 0; display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
                    ${parsedSizes.map((s, idx) => {
                let sizeLabel = s.size;
                if (isEn) {
                    if (sizeLabel === 'صغير') sizeLabel = 'Small';
                    if (sizeLabel === 'وسط') sizeLabel = 'Medium';
                    if (sizeLabel === 'كبير') sizeLabel = 'Large';
                }
                return `
                        <button type="button" 
                                id="size-btn-${item.id}-${s.size}"
                                onclick="selectSize(${item.id}, '${s.size}', ${s.price})"
                                style="padding: 5px 14px; border: 1px solid #e63946; background: ${idx === 0 ? '#e63946' : 'transparent'}; color: #ffffff; border-radius: 6px; cursor: pointer; font-weight: bold; font-family: 'Cairo', sans-serif; transition: all 0.2s;">
                            ${sizeLabel}
                        </button>
                    `;
            }).join('')}
                </div>
            `;
        }

        const currencyText = isEn ? 'AED' : 'د.إ';
        const addBtnText = isEn ? 'Add' : 'إضافة';

        return `
            <div style="border: 1px solid #2a2a2a; border-radius: 14px; overflow: hidden; background: #1e1e1e; box-shadow: 0 6px 20px rgba(0,0,0,0.6); text-align: center; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                    <!-- صورة الطبق -->
                    <div style="height: 190px; width: 100%; overflow: hidden; background: #000000;">
                        <img src="${itemImg}" alt="${itemName}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='images/logo.jpg'">
                    </div>
                    
                    <!-- جسم الكارت -->
                    <div style="padding: 16px;">
                        <h3 style="margin: 0 0 8px 0; font-size: 20px; color: #ffffff; font-weight: 800;">${itemName}</h3>
                        <p style="color: #b0b0b0; font-size: 13.5px; margin: 0 0 10px 0; min-height: 38px; line-height: 1.5;">${itemDesc}</p>
                        ${sizesHTML}
                    </div>
                </div>

                <!-- فوتر الكارت -->
                <div style="padding: 14px 16px; border-top: 1px solid #2a2a2a; display: flex; justify-content: space-between; align-items: center; background: #161616;">
                    <span id="price-${item.id}" style="font-weight: 800; color: #e63946; font-size: 20px;">
                        ${displayPrice} ${currencyText}
                    </span>
                    <button type="button" onclick="addToCartById(${item.id})" style="padding: 8px 18px; background: #e63946; color: #ffffff; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-family: 'Cairo', sans-serif;">
                        <i class="fa-solid fa-cart-plus"></i> ${addBtnText}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// اختيار الحجم
window.selectSize = function (itemId, sizeLabel, price) {
    selectedSizes[itemId] = { size: sizeLabel, price: price };

    const isEn = (getActiveLanguage() === 'en');
    const currencyText = isEn ? 'AED' : 'د.إ';

    const priceElem = document.getElementById(`price-${itemId}`);
    if (priceElem) priceElem.innerText = `${price} ${currencyText}`;

    const item = menuItems.find(i => Number(i.id) === Number(itemId));
    if (item && item.sizes) {
        let sizes = item.sizes;
        if (typeof sizes === 'string') {
            try { sizes = JSON.parse(sizes); } catch (e) { sizes = []; }
        }
        sizes.forEach(s => {
            const btn = document.getElementById(`size-btn-${itemId}-${s.size}`);
            if (btn) {
                btn.style.background = (s.size === sizeLabel) ? '#e63946' : 'transparent';
                btn.style.color = '#ffffff';
            }
        });
    }
};

// الفلترة
window.filterCategory = function (category) {
    document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));

    if (category === 'all' || !category) {
        renderMenu(menuItems);
    } else if (category === 'famous') {
        const famousItems = menuItems.filter(item => item.is_famous === true);
        renderMenu(famousItems);
    } else {
        const filtered = menuItems.filter(item => item.category === category);
        renderMenu(filtered);
    }
};

// دالة الإضافة
window.addToCartById = function (id) {
    const item = menuItems.find(i => Number(i.id) === Number(id));
    if (!item) return;

    const isEn = (getActiveLanguage() === 'en');
    const chosenSize = selectedSizes[id];

    let actualName = isEn
        ? (item.name_en || item.title_en || item.en_name || item.name || item.title || "Layali Al Helmia Dish")
        : (item.name_ar || item.name || item.title || item.item_name || "بيتزا ليالي الحلمية");

    const finalItem = {
        id: item.id,
        name: actualName,
        title: actualName,
        item_name: actualName,
        image: item.image_url || item.image || 'images/logo.jpg',
        image_url: item.image_url || item.image || 'images/logo.jpg',
        selectedSize: chosenSize ? chosenSize.size : (item.sizes && item.sizes[0] ? item.sizes[0].size : 'عادي'),
        price: chosenSize ? Number(chosenSize.price) : Number(item.price || (item.sizes && item.sizes[0] ? item.sizes[0].price : 0)),
        quantity: 1
    };

    // التخزين
    ["cart", "cart_items", "cartItems"].forEach(key => {
        let currentCart = [];
        try { currentCart = JSON.parse(localStorage.getItem(key)) || []; } catch (e) { currentCart = []; }

        const existingIndex = currentCart.findIndex(cartItem =>
            Number(cartItem.id) === Number(finalItem.id) &&
            cartItem.selectedSize === finalItem.selectedSize
        );

        if (existingIndex > -1) {
            currentCart[existingIndex].quantity = (currentCart[existingIndex].quantity || 1) + 1;
        } else {
            currentCart.push(finalItem);
        }

        localStorage.setItem(key, JSON.stringify(currentCart));
    });

    window.dispatchEvent(new Event("cartUpdated"));
    window.dispatchEvent(new Event("storage"));

    ['updateCartUI', 'renderCart', 'updateCartCount', 'loadCart', 'displayCart', 'renderCartItems'].forEach(fnName => {
        if (typeof window[fnName] === "function") {
            try { window[fnName](); } catch (e) { }
        }
    });

    const msg = isEn
        ? `"${actualName}" added to cart successfully!`
        : `تمت إضافة "${actualName}" إلى السلة بنجاح!`;

    alert(msg);
};
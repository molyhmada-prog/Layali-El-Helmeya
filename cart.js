let cart = JSON.parse(localStorage.getItem("hlmya_cart_v2")) || [];
let userLocation = null;

document.addEventListener("DOMContentLoaded", () => {
    updateCartUI();
});

function saveCart() {
    localStorage.setItem("hlmya_cart_v2", JSON.stringify(cart));
}

function toggleCartDrawer() {
    const drawer = document.getElementById("cartDrawer");
    const overlay = document.getElementById("cartOverlay");

    if (drawer && overlay) {
        drawer.classList.toggle("active");
        overlay.classList.toggle("active");
    }
}

function addToCart(item) {
    const existingIndex = cart.findIndex(c => c.id === item.id);

    if (existingIndex > -1) {
        cart[existingIndex].qty += 1;
    } else {
        cart.push({
            id: item.id,
            name_ar: item.name_ar,
            name_en: item.name_en,
            price: item.price,
            image_url: item.image_url,
            qty: 1
        });
    }

    saveCart();
    updateCartUI();

    const drawer = document.getElementById("cartDrawer");
    if (drawer && !drawer.classList.contains("active")) {
        toggleCartDrawer();
    }
}

function changeQty(index, delta) {
    if (cart[index]) {
        cart[index].qty += delta;
        if (cart[index].qty <= 0) {
            cart.splice(index, 1);
        }
        saveCart();
        updateCartUI();
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
}

function clearCart() {
    if (cart.length === 0) return;
    cart = [];
    saveCart();
    updateCartUI();
}

function updateCartUI() {
    const lang = localStorage.getItem("pref_lang") || "ar";
    const currency = lang === "ar" ? "د.إ" : "AED";

    const cartCountElem = document.getElementById("cartCount");
    const cartItemsCountVal = document.getElementById("cartItemsCountVal");
    const cartItemsContainer = document.getElementById("cartItemsContainer");
    const cartTotalAmount = document.getElementById("cartTotalAmount");

    const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);
    if (cartCountElem) cartCountElem.innerText = totalQty;
    if (cartItemsCountVal) cartItemsCountVal.innerText = totalQty;

    let totalCost = 0;

    if (cartItemsContainer) {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart-state">
                    <div class="empty-cart-icon"><i class="fa-solid fa-basket-shopping"></i></div>
                    <h4>${translations[lang].cartEmptyTitle}</h4>
                    <p>${translations[lang].cartEmptySub}</p>
                </div>`;
        } else {
            cartItemsContainer.innerHTML = cart.map((item, idx) => {
                const itemTotal = item.price * item.qty;
                totalCost += itemTotal;
                const name = lang === "ar" ? item.name_ar : (item.name_en || item.name_ar);

                return `
                    <div class="cart-item-card">
                        <img src="${item.image_url || 'images/logo.jpg'}" alt="${name}" class="cart-item-img" onerror="this.src='images/logo.jpg'">
                        <div class="cart-item-info">
                            <div class="cart-item-title">${name}</div>
                            <div class="cart-item-price">${item.price} ${currency}</div>
                        </div>
                        <div class="cart-item-controls">
                            <button type="button" class="remove-btn" onclick="removeFromCart(${idx})" title="إزالة">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                            <div class="qty-counter">
                                <button type="button" class="qty-btn" onclick="changeQty(${idx}, -1)">-</button>
                                <span class="qty-val">${item.qty}</span>
                                <button type="button" class="qty-btn" onclick="changeQty(${idx}, 1)">+</button>
                            </div>
                        </div>
                    </div>
                `;
            }).join("");
        }
    }

    if (cartTotalAmount) {
        cartTotalAmount.innerText = `${totalCost} ${currency}`;
    }
}

function getUserLocation() {
    const lang = localStorage.getItem("pref_lang") || "ar";
    const locBtn = document.getElementById("locationBtn");
    const locBtnText = document.getElementById("locationBtnText");
    const locStatus = document.getElementById("locationStatus");

    if (!navigator.geolocation) {
        if (locStatus) {
            locStatus.innerText = translations[lang].locNotSupported;
            locStatus.className = "location-status error";
        }
        return;
    }

    if (locBtnText) locBtnText.innerText = translations[lang].locGetting;

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;

            userLocation = { lat, lng, mapUrl };

            if (locBtnText) locBtnText.innerText = translations[lang].locSuccess;
            if (locBtn) locBtn.classList.add("success");
            if (locStatus) locStatus.innerText = "";
        },
        (error) => {
            if (locBtnText) locBtnText.innerText = translations[lang].btnChooseLocation;
            if (locStatus) {
                locStatus.className = "location-status error";
                locStatus.innerText = translations[lang].locDenied;
            }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
}

function submitOrderWhatsApp() {
    const lang = localStorage.getItem("pref_lang") || "ar";
    const currency = lang === "ar" ? "د.إ" : "AED";
    const name = document.getElementById("custName") ? document.getElementById("custName").value.trim() : "";
    const phone = document.getElementById("custPhone") ? document.getElementById("custPhone").value.trim() : "";
    const notes = document.getElementById("custNotes") ? document.getElementById("custNotes").value.trim() : "";

    if (cart.length === 0) {
        alert(translations[lang].alertCartEmpty);
        return;
    }

    if (!name || !phone || !userLocation) {
        alert(translations[lang].alertNamePhoneLoc);
        return;
    }

    let total = 0;
    let itemsText = "";

    cart.forEach(item => {
        const itemTotal = item.price * item.qty;
        total += itemTotal;
        const itemName = lang === "ar" ? item.name_ar : (item.name_en || item.name_ar);
        itemsText += `• ${itemName} × ${item.qty} = ${itemTotal} ${currency}\n`;
    });

    let msg = "";

    if (lang === "ar") {
        msg = `*طلب جديد - ليالي الحلمية*\n` +
            `👤 *الاسم:* ${name}\n` +
            `📞 *الهاتف:* ${phone}\n\n` +
            `🛒 *الطلبات:*\n${itemsText}\n` +
            `💰 *الإجمالي:* ${total} ${currency}\n\n` +
            `📍 *موقع التوصيل:*\n${userLocation.mapUrl}`;
        if (notes) msg += `\n\n📝 *ملاحظات:* ${notes}`;
    } else {
        msg = `*New Order - Layali El Helmeya*\n` +
            `👤 *Name:* ${name}\n` +
            `📞 *Phone:* ${phone}\n\n` +
            `🛒 *Items:*\n${itemsText}\n` +
            `💰 *Total:* ${total} ${currency}\n\n` +
            `📍 *Delivery Location:*\n${userLocation.mapUrl}`;
        if (notes) msg += `\n\n📝 *Notes:* ${notes}`;
    }

    const encodedMsg = encodeURIComponent(msg);
    const waUrl = `https://wa.me/${CONFIG.whatsapp}?text=${encodedMsg}`;

    window.open(waUrl, "_blank");
}

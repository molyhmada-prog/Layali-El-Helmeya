// ==========================================
// ملف لوحة التحكم للإدارة (js/admin.js)
// ==========================================

let adminItems = [];

const CATEGORY_MAP = {
    'feteer': { ar: 'فطير' },
    'pizza': { ar: 'بيتزا' },
    'tawagen': { ar: 'طواجن' }
};

document.addEventListener("DOMContentLoaded", async () => {
    await checkAuthSession();
    fetchAdminMenuItems();

    const form = document.getElementById("itemForm");
    if (form) {
        form.addEventListener("submit", handleSaveItem);
    }
});

async function checkAuthSession() {
    const client = window.supabaseClient || window.supabase;
    if (!client || !client.auth) return;

    const { data: { session } } = await client.auth.getSession();
    if (!session && window.location.pathname.includes("admin")) {
        // يمكن تفعيل التوجيه لصفحة اللوجن إذا كانت مطلوبة
        // window.location.href = "login.html";
    }
}

async function fetchAdminMenuItems() {
    const client = window.supabaseClient || window.supabase;
    if (!client) return;

    const { data, error } = await client
        .from('menu_items')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        console.error("خطأ في جلب البيانات:", error.message);
        return;
    }

    adminItems = data || [];
    renderAdminTable(adminItems);
}

function renderAdminTable(items) {
    const tbody = document.getElementById("adminMenuTableBody");
    if (!tbody) return;

    if (!items || items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 20px;">لا توجد أصناف معروضة</td></tr>`;
        return;
    }

    tbody.innerHTML = items.map(item => `
        <tr>
            <td><img src="${item.image_url || 'images/logo.jpg'}" class="item-thumb" onerror="this.src='images/logo.jpg'" style="width:50px; height:50px; object-fit:cover; border-radius:6px;"></td>
            <td>
                <strong>${item.name}</strong><br>
                <small style="color:#aaa;">${item.name_en || ''}</small>
            </td>
            <td>${CATEGORY_MAP[item.category] ? CATEGORY_MAP[item.category].ar : item.category}</td>
            <td><strong>${item.price} د.إ</strong></td>
            <td>
                <span class="badge ${item.is_visible !== false ? 'badge-visible' : 'badge-hidden'}">
                    ${item.is_visible !== false ? 'معروض' : 'مخفي'}
                </span>
            </td>
            <td>
                ${item.is_famous ? '<span class="badge badge-famous">شهير</span>' : '-'}
            </td>
            <td>
                <div class="action-btns">
                    <button type="button" class="btn-icon edit" onclick="editItem('${item.id}')" title="تعديل"><i class="fa-solid fa-pen"></i></button>
                    <button type="button" class="btn-icon delete" onclick="deleteItem('${item.id}')" title="حذف"><i class="fa-solid fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openItemModal() {
    const form = document.getElementById("itemForm");
    if (form) form.reset();
    if (document.getElementById("itemId")) document.getElementById("itemId").value = "";
    if (document.getElementById("modalTitle")) document.getElementById("modalTitle").innerText = "إضافة صنف جديد";

    const modal = document.getElementById("itemModal");
    if (modal) modal.style.display = "flex";
}

function closeItemModal() {
    const modal = document.getElementById("itemModal");
    if (modal) modal.style.display = "none";
}

function editItem(id) {
    const item = adminItems.find(i => i.id.toString() === id.toString());
    if (!item) return;

    if (document.getElementById("itemId")) document.getElementById("itemId").value = item.id;
    if (document.getElementById("itemNameAr")) document.getElementById("itemNameAr").value = item.name || "";
    if (document.getElementById("itemNameEn")) document.getElementById("itemNameEn").value = item.name_en || "";
    if (document.getElementById("itemCategory")) document.getElementById("itemCategory").value = item.category || "";
    if (document.getElementById("itemPriceInput")) document.getElementById("itemPriceInput").value = item.price || 0;
    if (document.getElementById("itemDescAr")) document.getElementById("itemDescAr").value = item.description || "";
    if (document.getElementById("itemDescEn")) document.getElementById("itemDescEn").value = item.description_en || "";
    if (document.getElementById("itemImageUrl")) document.getElementById("itemImageUrl").value = item.image_url || "";

    if (document.getElementById("modalTitle")) document.getElementById("modalTitle").innerText = "تعديل بيانات الصنف";
    const modal = document.getElementById("itemModal");
    if (modal) modal.style.display = "flex";
}

async function handleSaveItem(e) {
    e.preventDefault();
    const client = window.supabaseClient || window.supabase;

    const id = document.getElementById("itemId") ? document.getElementById("itemId").value : "";
    const fileInput = document.getElementById("itemImageFile");
    let imageUrl = document.getElementById("itemImageUrl") ? document.getElementById("itemImageUrl").value : "";

    if (fileInput && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;

        const { uploadData, error: uploadError } = await client
            .storage
            .from('dishes')
            .upload(fileName, file);

        if (!uploadError) {
            const { data: publicUrlData } = client
                .storage
                .from('dishes')
                .getPublicUrl(fileName);
            imageUrl = publicUrlData.publicUrl;
        }
    }

    const payload = {
        name: document.getElementById("itemNameAr").value,
        name_en: document.getElementById("itemNameEn") ? document.getElementById("itemNameEn").value : "",
        category: document.getElementById("itemCategory").value,
        price: parseFloat(document.getElementById("itemPriceInput").value),
        description: document.getElementById("itemDescAr") ? document.getElementById("itemDescAr").value : "",
        description_en: document.getElementById("itemDescEn") ? document.getElementById("itemDescEn").value : "",
        image_url: imageUrl || 'images/logo.jpg'
    };

    let resultError = null;

    if (id) {
        const { error } = await client.from('menu_items').update(payload).eq('id', id);
        resultError = error;
    } else {
        const { error } = await client.from('menu_items').insert([payload]);
        resultError = error;
    }

    if (resultError) {
        alert("حدث خطأ أثناء حفظ الصنف: " + resultError.message);
    } else {
        alert("تم الحفظ بنجاح!");
        closeItemModal();
        fetchAdminMenuItems();
    }
}

async function deleteItem(id) {
    if (confirm("هل أنت متأكد من إزالة هذا الطبق بشكل نهائي؟")) {
        const client = window.supabaseClient || window.supabase;
        const { error } = await client.from('menu_items').delete().eq('id', id);
        if (error) {
            alert("حدث خطأ أثناء الحذف: " + error.message);
        } else {
            alert("تم الحذف بنجاح");
            fetchAdminMenuItems();
        }
    }
}
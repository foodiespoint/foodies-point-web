// ==========================================================================
// 1. GLOBAL PRODUCTION CONFIGURATIONS & STATE REGISTRY (VERSION 48)
// ==========================================================================
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for(let registration of registrations) { registration.unregister(); }
    });
}

let deferredPrompt = null;
let installPromptSupported = false; 
let cart = [];

let isConsoleViewActive = false;
let currentLiveMenuArray = []; 
let pendingLiveArray = [];     

const ROUTING_SECRET_PIN = "validatefoodies2026"; 

const pwaModal = document.getElementById('pwa-modal');
const pwaOverlay = document.getElementById('pwa-overlay');
const notifModal = document.getElementById('notification-modal');
const notifOverlay = document.getElementById('notification-overlay');
const body = document.body;
const updateSplash = document.getElementById('update-splash');
const splashText = document.getElementById('splash-text');

// MASTER CATALOG DATA CONTAINER (102 Items)
const MASTER_MENU = [
    { id: "roll_1", title: "Dahi Bread Roll", details: "15/- per pc.", category: "ROLLS" },
    { id: "roll_2", title: "Bread Roll", details: "80/- per plate (8 pc.)", category: "ROLLS" },
    { id: "roll_3", title: "Spring Roll", details: "25/- per pc.", category: "ROLLS" },
    { id: "roll_4", title: "Veg Kebab Roll", details: "20/- per pc.", category: "ROLLS" },
    { id: "roll_5", title: "Paneer Roll", details: "45/- per pc.", category: "ROLLS" },
    { id: "roll_6", title: "Egg Mayonaise & Cheese Mix Roll", details: "50/- per pc.", category: "ROLLS" },
    { id: "roll_7", title: "Egg Mayonaise Roll", details: "40/- per pc.", category: "ROLLS" },
    { id: "roll_8", title: "Egg Roll", details: "35/- per pc.", category: "ROLLS" },
    { id: "roll_9", title: "Chicken Roll", details: "55/- pr pc.", category: "ROLLS" },
    { id: "roll_10", title: "Chicken Mayonaise Roll", details: "60/- per pc.", category: "ROLLS" },
    { id: "roll_11", title: "Chicken Egg Roll", details: "70/- per pc.", category: "ROLLS" },
    { id: "roll_12", title: "Chicken Egg Mayonaise Roll", details: "75/-", category: "ROLLS" },

    { id: "pak_1", title: "Pyaaz ki Pakodi", details: "60 (250gm)", category: "PAKODI" },
    { id: "pak_2", title: "Paalak ki pakodi", details: "60 (250gm)", category: "PAKODI" },
    { id: "pak_3", title: "Gobhi ki pajkodi", details: "60 (250gm)", category: "PAKODI" },
    { id: "pak_4", title: "Mirch ki pakodi", details: "15 per pc.", category: "PAKODI" },
    { id: "pak_5", title: "Bread Pakoda", details: "20/- per pc.", category: "PAKODI" },
    { id: "pak_6", title: "Egg pakodi", details: "10/- per pc", category: "PAKODI" },
    { id: "pak_7", title: "Moong daal ke mongode", details: "75 (250gm)", category: "PAKODI" },

    { id: "sand_1", title: "Veg Grilled Mayonaise Sandwich", details: "55/- (2 pc)", category: "SANDWICH" },
    { id: "sand_2", title: "Veg Cheese Sandwich", details: "60/- (2 pc)", category: "SANDWICH" },
    { id: "sand_3", title: "Veg Sandwich", details: "18/- per pc", category: "SANDWICH" },

    { id: "snack_1", title: "Chocolate Croissant", details: "48 per pc", category: "SNACKS" },
    { id: "snack_2", title: "Zingy Parcel (Paneer)", details: "60 per pc", category: "SNACKS" },
    { id: "snack_3", title: "Pizza Puff", details: "18 per pc", category: "SNACKS" },
    { id: "snack_4", title: "Mini Pizza", details: "45 per pc", category: "SNACKS" },
    { id: "snack_5", title: "Veg Burger", details: "50 per pc", category: "SNACKS" },
    { id: "snack_6", title: "Aloo Patty", details: "17 per pc", category: "SNACKS" },
    { id: "snack_7", title: "Paneer Patty", details: "25 per pc", category: "SNACKS" },
    { id: "snack_8", title: "Veg Appe", details: "65 per plate", category: "SNACKS" },
    { id: "snack_9", title: "Phare", details: "70 250gm", category: "SNACKS" },
    { id: "snack_10", title: "Veg Masala Idli", details: "45 per plate", category: "SNACKS" },
    { id: "snack_11", title: "Fried Idli", details: "50 per plate", category: "SNACKS" },
    { id: "snack_12", title: "Poha", details: "80 per plate", category: "SNACKS" },
    { id: "snack_13", title: "Stuffed Mushroom", details: "65 per plate (4 pc)", category: "SNACKS" },
    { id: "snack_14", title: "Aloo Bonda", details: "12 per pc", category: "SNACKS" },
    { id: "snack_15", title: "Vada Pav", details: "25 per pc", category: "SNACKS" },
    { id: "snack_16", title: "Cheese Balls", details: "80 per plate (8 pc)", category: "SNACKS" },
    { id: "snack_17", title: "Masala Vada", details: "80 per plate (8 pc)", category: "SNACKS" },
    { id: "snack_18", title: "Falafel Mushakkal Veg. Roll", details: "40", category: "SNACKS" },
    { id: "snack_19", title: "Pani Poori", details: "15 (5 pc)", category: "SNACKS" },
    { id: "snack_20", title: "Tikki Chaat", details: "55 per plate", category: "SNACKS" },
    { id: "snack_21", title: "Dahi vada", details: "60 per plate (4pc)", category: "SNACKS" },
    { id: "snack_22", title: "Raj Kachori", details: "85 per plate", category: "SNACKS" },
    { id: "snack_23", title: "Samosa", details: "12 per pc", category: "SNACKS" },
    { id: "snack_24", title: "Paneer Tikka", details: "240 per plate", category: "SNACKS" },
    { id: "snack_25", title: "Paneer Malai Tikka", details: "260 per plate", category: "SNACKS" },

    { id: "chin_1", title: "Honey Chilli Potato", details: "90 per plate", category: "CHINESE" },
    { id: "chin_2", title: "Chowmein", details: "80 per plate", category: "CHINESE" },
    { id: "chin_3", title: "Macaroni", details: "80 per plate", category: "CHINESE" },
    { id: "chin_4", title: "Fried Rice", details: "80 per plate", category: "CHINESE" },
    { id: "chin_5", title: "Veg Manchurian", details: "80 pr plate", category: "CHINESE" },
    { id: "chin_6", title: "Paneer Manchurian", details: "160 per plate", category: "CHINESE" },
    { id: "chin_7", title: "Chilli Paneer", details: "140 per plate", category: "CHINESE" },
    { id: "chin_8", title: "Veg momos", details: "55 per plate (10 pc)", category: "CHINESE" },
    { id: "chin_9", title: "Paneer momos", details: "75 per plate (10 pc)", category: "CHINESE" },
    { id: "chin_10", title: "Chicken momos", details: "100 per plate (10 pc)", category: "CHINESE" },
    { id: "chin_11", title: "White Pasta", details: "100 per plate", category: "CHINESE" },

    { id: "keb_1", title: "Veg. Seekh Kebab", details: "15 per pc", category: "KEBEBS" },
    { id: "keb_2", title: "Veg Kebab", details: "17 per pc", category: "KEBEBS" },
    { id: "keb_3", title: "Dahi ke kebab", details: "25 per pc", category: "KEBEBS" },
    { id: "keb_4", title: "Hariyali kebab", details: "25 per pc", category: "KEBEBS" },

    { id: "cake_1", title: "Tutti Frutti Cup Cake", details: "18 per pc", category: "CAKE (Egg-Less)" },
    { id: "cake_2", title: "Chocolate Cup Cake", details: "20 per pc", category: "CAKE (Egg-Less)" },
    { id: "cake_3", title: "Chocolava Cup Cake", details: "38 per pc", category: "CAKE (Egg-Less)" },

    { id: "shake_1", title: "Mango Shake", details: "30", category: "SHAKES" },
    { id: "shake_2", title: "Lassi", details: "45", category: "SHAKES" },
    { id: "shake_3", title: "Panna", details: "12", category: "SHAKES" },

    { id: "trad_1", title: "Chokha Baati", details: "50 per plate (2 pc)", category: "COMBOS" },
    { id: "trad_2", title: "Chole Aloo Kulche", details: "70 per plate", category: "COMBOS" },
    { id: "trad_3", title: "Chole Bhature", details: "60 per plate", category: "COMBOS" },
    { id: "trad_4", title: "Khasta Aloo Matar", details: "55 per plate (2 pc)", category: "COMBOS" },
    { id: "trad_5", title: "Sambhar Vada", details: "55 per plate (4 pc)", category: "COMBOS" },
    { id: "trad_6", title: "Idli Sambhar", details: "55 per plate (4 pc)", category: "COMBOS" },
    { id: "trad_7", title: "Pav Bhaaji", details: "60 per plate", category: "COMBOS" },

    { id: "sweet_1", title: "Gulab Jamun", details: "20", category: "SWEETS" },
    { id: "sweet_2", title: "Kheer", details: "80", category: "SWEETS" },
    { id: "sweet_3", title: "Sweet Rice", details: "90", category: "SWEETS" },
    { id: "sweet_4", title: "Shrikhand", details: "85 (250 gm)", category: "SWEETS" },

    { id: "sabzi_1", title: "Shaahi Paneer", details: "300", category: "SABZI" },
    { id: "sabzi_2", title: "Paneer Masala", details: "220", category: "SABZI" },
    { id: "sabzi_3", title: "Paneer Angara", details: "280", category: "SABZI" },
    { id: "sabzi_4", title: "Paneer Korma", details: "Price on request", category: "SABZI" },
    { id: "sabzi_5", title: "Palak Paneer", details: "200", category: "SABZI" },
    { id: "sabzi_6", title: "Matar Paneer", details: "200", category: "SABZI" },

    { id: "nv_1", title: "Chichen Afghani", details: "500", category: "NON-VEG" },
    { id: "nv_2", title: "Roasted Chicken", details: "340", category: "NON-VEG" },
    { id: "nv_3", title: "Chilli Chicken", details: "440", category: "NON-VEG" },
    { id: "nv_4", title: "Egg Curry", details: "75", category: "NON-VEG" },
    { id: "nv_5", title: "Fish Fry (boneless)", details: "180 (250 gm)", category: "NON-VEG" },
    { id: "nv_6", title: "Fish Dry (boneless)", details: "165 (250 gm)", category: "NON-VEG" },
    { id: "nv_7", title: "Chicken Shawarma", details: "90", category: "NON-VEG" },
    { id: "nv_8", title: "Mutton Curry", details: "400", category: "NON-VEG" },
    { id: "nv_9", title: "Mutton Korma", details: "430", category: "NON-VEG" },
    { id: "nv_10", title: "Keema Kaleji", details: "400", category: "NON-VEG" },
    { id: "nv_11", title: "Chicken Curry", details: "360", category: "NON-VEG" },
    { id: "nv_12", title: "Chicken Masala", details: "400", category: "NON-VEG" },
    { id: "nv_13", title: "Butter Chicken", details: "500", category: "NON-VEG" },

    { id: "rice_1", title: "Plain Rice", details: "90", category: "RICE" },
    { id: "rice_2", title: "Jeera Rice", details: "120", category: "RICE" },
    { id: "rice_3", title: "Matar Pulao", details: "140", category: "RICE" },
    { id: "rice_4", title: "Veg. Biryani", details: "180", category: "RICE" }
];

// ==========================================================================
// 2. MINIMUM SPLASH LOAD TIME
// ==========================================================================
let minimumSplashTimeMet = false;
setTimeout(() => { minimumSplashTimeMet = true; tryDismissSplash(); }, 1200);

const splashFailSafeGuard = setTimeout(() => { forceDismissSplash(); }, 4000);

function tryDismissSplash() {
    if (minimumSplashTimeMet) forceDismissSplash();
}

function forceDismissSplash() {
    clearTimeout(splashFailSafeGuard);
    if (updateSplash) {
        updateSplash.style.transition = "opacity 0.4s ease, visibility 0.4s";
        updateSplash.style.opacity = "0";
        setTimeout(() => { updateSplash.style.display = "none"; }, 400);
    }
}

window.addEventListener('load', () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js?v=48').then(reg => {
            if (!navigator.serviceWorker.controller) { tryDismissSplash(); return; }
            reg.onupdatefound = () => {
                const installingWorker = reg.installing;
                installingWorker.onstatechange = () => {
                    if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        if (splashText) splashText.innerHTML = "New update found!<br><span style='color:#FF4B3A; font-size:14px; font-weight:500;'>Installing assets... Please do not close the app.</span>";
                    }
                };
            };
        }).catch(err => { console.error("SW Error:", err); tryDismissSplash(); });
    } else {
        tryDismissSplash();
    }
});

let refreshing = false;
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) { refreshing = true; window.location.reload(); }
    });
}

// ==========================================
// 3. MANDATORY UI & HYBRID NOTIFICATION ENGINE
// ==========================================
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); deferredPrompt = e; installPromptSupported = true; 
    if (localStorage.getItem('pwa_installed_successfully') !== 'true') showMandatoryModal();
    else initNotificationGestureCheck(); 
});

function triggerNativeInstall() {
    if (!deferredPrompt) { dismissMandatoryModal(); return; }
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => { deferredPrompt = null; dismissMandatoryModal(); });
}

window.addEventListener('appinstalled', () => { 
    localStorage.setItem('pwa_installed_successfully', 'true'); 
    dismissMandatoryModal(); 
});

function showMandatoryModal() { if (pwaModal && pwaOverlay) { pwaModal.style.display = 'flex'; pwaOverlay.style.display = 'block'; body.classList.add('stop-scrolling'); } }
function dismissMandatoryModal() { if (pwaModal && pwaOverlay) { pwaModal.style.display = 'none'; pwaOverlay.style.display = 'none'; body.classList.remove('stop-scrolling'); initNotificationGestureCheck(); } }

function initNotificationGestureCheck() {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') return;
    const triggerBlocker = () => {
        if (pwaModal && pwaModal.style.display === 'flex') return;
        if (updateSplash && updateSplash.style.display !== 'none') return;
        if (Notification.permission !== 'granted') showNotificationModal();
    };
    window.addEventListener('click', triggerBlocker, { once: true });
    window.addEventListener('touchstart', triggerBlocker, { once: true });
}

function showNotificationModal() { if (notifModal && notifOverlay) { notifModal.style.display = 'flex'; notifOverlay.style.display = 'block'; body.classList.add('stop-scrolling'); } }

function acceptNotificationModal() {
    if (notifModal && notifOverlay) { notifModal.style.display = 'none'; notifOverlay.style.display = 'none'; body.classList.remove('stop-scrolling'); }
    Notification.requestPermission().then((permission) => {
        if (permission === 'granted') triggerInstantNotification('🍕 Alerts Enabled! Your live tracking is active.', 'success');
        else initNotificationGestureCheck();
    });
}

// 🚀 FIXED: Hybrid Notification. Drops a visible toast AND tries a system push
function triggerInstantNotification(messageText, type = 'success') {
    // 1. Fire the visual In-App Toast
    const toastContainer = document.getElementById('toast-container');
    if (toastContainer) {
        const toast = document.createElement('div');
        const bgColor = type === 'error' ? '#EF4444' : (type === 'info' ? '#3B82F6' : '#10B981');
        toast.style.cssText = `background: ${bgColor}; color: white; padding: 14px 20px; border-radius: 12px; font-size: 14px; font-weight: 600; box-shadow: 0 10px 25px rgba(0,0,0,0.2); animation: toastFadeIn 0.3s forwards; pointer-events: auto;`;
        toast.innerText = messageText;
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'toastFadeOut 0.3s forwards';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // 2. Fire the Background System Push (If allowed and supported)
    if ('Notification' in window && Notification.permission === 'granted') {
        navigator.serviceWorker.ready.then((reg) => { 
            reg.showNotification('Foodies Point', { body: messageText, icon: 'icon.png', badge: 'icon.png', vibrate: [200, 100, 200] }); 
        });
    }
}

// ==========================================
// 4. FIREBASE REALTIME INITIALIZATION
// ==========================================
const firebaseConfig = { databaseURL: "https://foodiespoint-6760-default-rtdb.asia-southeast1.firebasedatabase.app/" };
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// ==========================================
// 5. BULLETPROOF IST TIMEZONE LOCKOUT ENGINE
// ==========================================
function isKitchenBlackoutActive() {
    const now = new Date();
    const istFormatter = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false });
    const istTimeParts = istFormatter.format(now).split(':');
    const currentHour = parseInt(istTimeParts[0], 10);
    const currentMinute = parseInt(istTimeParts[1], 10);
    const totalMinutesPassed = (currentHour * 60) + currentMinute;
    const lockStartMinutes = 18 * 60; // 6:00 PM
    const lockReleaseMinutes = (21 * 60) + 30; // 9:30 PM
    return (totalMinutesPassed >= lockStartMinutes && totalMinutesPassed < lockReleaseMinutes);
}

function enforceBlackoutUILayout() {
    if (isConsoleViewActive) return;
    const historyContainer = document.getElementById('history-container');
    localStorage.removeItem('foodies_tracked_orders');
    cart = [];
    if (cartBtn) cartBtn.style.display = 'none';
    
    const menuContainer = document.getElementById('menu-container');
    menuContainer.innerHTML = `<div style="text-align: center; padding: 32px 16px; background-color: #FFFFFF; border-radius: 18px; border: 1px dashed #E5E7EB; width: 100%; box-sizing: border-box;"><div style="font-size: 32px; margin-bottom: 8px;">⏰</div><div style="font-weight: 700; font-size: 15px; color: #111827;">Kitchen Closed for Today</div><div style="color: #6B7280; font-size: 13px; margin-top: 4px; line-height: 1.5;">Tomorrow's live menu will be available after 9:30 PM IST.</div></div>`;
    if (historyContainer) historyContainer.innerHTML = `<p style="text-align: center; color: #9CA3AF; font-size: 13px; margin-top: 12px; font-style: italic;">History cleared for the day.</p>`;
}

// ==========================================
// 6. MAIN DATA PIPELINES: LIVE MENU CONTROLLER
// ==========================================
const menuContainer = document.getElementById('menu-container');
const cartBtn = document.getElementById('cart-btn');

database.ref('daily_live_menu').on('value', (snapshot) => {
    currentLiveMenuArray = [];
    snapshot.forEach((child) => { currentLiveMenuArray.push(child.val()); });

    if (isKitchenBlackoutActive()) { enforceBlackoutUILayout(); return; }
    if (isConsoleViewActive) return; 
    renderCustomerMenu();
});

function renderCustomerMenu() {
    menuContainer.innerHTML = ''; 
    if (currentLiveMenuArray.length === 0) {
        menuContainer.innerHTML = '<p style="text-align: center; color: #9CA3AF; margin-top: 20px;">The kitchen has not posted a menu yet today.</p>'; return;
    }

    const todayStr = new Date().toLocaleDateString();
    const lastNotifiedDate = localStorage.getItem('foodies_menu_notified_date');
    if (lastNotifiedDate !== todayStr) {
        triggerInstantNotification('🍽️ Today\'s Menu is Live! Tap here to check what\'s cooking.', 'info');
        localStorage.setItem('foodies_menu_notified_date', todayStr);
    }

    currentLiveMenuArray.forEach((item) => {
        const card = document.createElement('div');
        const isStocked = !item.isOutOfStock;
        const opacitySetting = isStocked ? '1.0' : '0.6';
        
        const badgeHTML = isStocked ? `<span style="background-color: #EEF2F6; color: #4B5563; font-size: 10px; font-weight: 600; padding: 4px 8px; border-radius: 6px; text-transform: uppercase;">${item.category}</span>` : `<span style="background-color: #FEE2E2; color: #EF4444; font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 6px;">OUT OF STOCK</span>`;
        const actionButtonHTML = isStocked ? `<button onclick="addToCart('${item.id}', '${item.title}', '${item.details}')" style="background-color: #FF4B3A; color: white; padding: 8px 16px; border: none; border-radius: 10px; font-weight: 600; font-size: 13px; cursor: pointer; box-shadow: 0 4px 10px rgba(255, 75, 58, 0.15);">+ Add</button>` : `<button disabled style="background-color: #F3F4F6; color: #9CA3AF; padding: 8px 14px; border: none; border-radius: 10px; font-weight: 500; font-size: 13px;">N/A</button>`;

        card.style.cssText = `background-color: #FFFFFF; padding: 16px; border-radius: 18px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03); border: 1px solid #F3F4F6; opacity: ${opacitySetting}; display: flex; justify-content: space-between; align-items: center;`;
        card.innerHTML = `<div style="flex-grow: 1; padding-right: 16px;"><div style="margin-bottom: 6px; display: inline-block;">${badgeHTML}</div><div style="font-size: 16px; font-weight: 600; color: #111827; letter-spacing: -0.3px; margin-top: 2px;">${item.title}</div><div style="color: #6B7280; font-size: 13px; margin-top: 3px; line-height: 1.4;">${item.details}</div></div><div style="flex-shrink: 0;">${actionButtonHTML}</div>`;
        menuContainer.appendChild(card);
    });
}

// ==========================================
// 7. CLIENT-SIDE ORDER HISTORY PIPELINE
// ==========================================
function listenToOrderHistory() {
    if (isKitchenBlackoutActive()) return enforceBlackoutUILayout();
    const historyContainer = document.getElementById('history-container');
    const trackList = JSON.parse(localStorage.getItem('foodies_tracked_orders') || '[]');
    
    if (trackList.length === 0) { 
        historyContainer.innerHTML = '<p style="text-align: center; color: #9CA3AF; font-size: 13px; margin-top: 12px;">No orders placed today yet.</p>'; return; 
    }
    if (historyContainer.innerHTML.includes("No orders placed today") || historyContainer.innerHTML.includes("History cleared")) { historyContainer.innerHTML = ''; }

    let notifiedStatuses = JSON.parse(localStorage.getItem('foodies_notified_statuses') || '{}');
    
    trackList.forEach(orderId => {
        database.ref(`orders/${orderId}`).on('value', (snapshot) => {
            if (isKitchenBlackoutActive() || isConsoleViewActive) return; 
            const order = snapshot.val();
            if (!order) return;
            
            let card = document.getElementById(`history-card-${orderId}`);
            let isNew = false;
            if (!card) { card = document.createElement('div'); card.id = `history-card-${orderId}`; isNew = true; }
            
            let statusText = "On Hold"; let badgeColor = "#D97706"; let bgColor = "#FEF3C7";
            const currentStatusKey = `${orderId}_${order.status}`;
            
            if (order.status === "ACCEPTED") { 
                statusText = "Accepted"; badgeColor = "#059669"; bgColor = "#D1FAE5"; 
                if (!notifiedStatuses[currentStatusKey]) {
                    triggerInstantNotification(`✅ Order Accepted! The kitchen is preparing your food.`, 'success');
                    notifiedStatuses[currentStatusKey] = true;
                    localStorage.setItem('foodies_notified_statuses', JSON.stringify(notifiedStatuses));
                }
            } 
            else if (order.status === "REJECTED") { 
                statusText = "Rejected"; badgeColor = "#DC2626"; bgColor = "#FEE2E2"; 
                if (!notifiedStatuses[currentStatusKey]) {
                    triggerInstantNotification(`❌ Order Rejected. Please contact the kitchen.`, 'error');
                    notifiedStatuses[currentStatusKey] = true;
                    localStorage.setItem('foodies_notified_statuses', JSON.stringify(notifiedStatuses));
                }
            } else if (order.status === "HOLD" || order.status === "PENDING") {
                statusText = "On Hold"; badgeColor = "#D97706"; bgColor = "#FEF3C7";
            }
            
            card.style.cssText = `background-color: #F9FAFB; padding: 14px; border-radius: 14px; border: 1px solid #E5E7EB; display: flex; justify-content: space-between; align-items: center;`;
            card.innerHTML = `<div style="flex-grow: 1; padding-right: 12px;"><div style="font-size: 13px; font-weight: 600; color: #111827; line-height: 1.4;">${order.items}</div><div style="font-size: 11px; color: #9CA3AF; margin-top: 4px;">Ordered at ${new Date(order.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div></div><span style="background-color: ${bgColor}; color: ${badgeColor}; font-size: 11px; font-weight: 700; padding: 6px 12px; border-radius: 20px; text-transform: uppercase; white-space: nowrap; letter-spacing: 0.3px;">${statusText}</span>`;
            if (isNew) historyContainer.insertBefore(card, historyContainer.firstChild);
        });
    });
}

function addToCart(id, title, details) {
    if (isKitchenBlackoutActive()) return alert("The kitchen is currently closed.");
    const existingItem = cart.find(i => i.id === id);
    if (details.toLowerCase().includes("per plate") && existingItem && existingItem.quantity >= 5) return alert(`⚠️ Order Limit Exceeded!`);
    if (existingItem) existingItem.quantity += 1; else cart.push({ id, title, details, quantity: 1 });
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBtn.style.display = 'block'; cartBtn.innerText = `View Order (${totalItems} items)`;
}

function openCheckout() {
    if (isKitchenBlackoutActive()) return;
    document.getElementById('checkout-modal').style.display = 'flex'; body.classList.add('stop-scrolling'); 
    const summaryDiv = document.getElementById('cart-summary');
    let summaryHTML = '<div style="font-weight: 600; color: #111827; margin-bottom: 8px; font-size: 15px;">Selected Items:</div>';
    cart.forEach(item => { summaryHTML += `<div style="display: flex; justify-content: space-between; margin-bottom: 4px;"><span>🟢 ${item.title}</span><span style="font-weight: 600; color: #111827;">x${item.quantity}</span></div>`; });
    summaryDiv.innerHTML = summaryHTML;
}

function closeCheckout() { document.getElementById('checkout-modal').style.display = 'none'; body.classList.remove('stop-scrolling'); }

function submitOrder() {
    if (isKitchenBlackoutActive()) return alert("The kitchen is currently closed for the day.");
    const firstName = document.getElementById('customer-first-name').value.trim();
    const lastName = document.getElementById('customer-last-name').value.trim();
    const phone = document.getElementById('customer-phone').value.trim();

    if (firstName === "" || lastName === "") return alert("Please enter both your First Name and Last Name.");
    if (phone === "" || phone.length !== 10) return alert("Please enter a valid 10-digit mobile number.");
    if (cart.length === 0) return;

    const completeFullName = `${firstName} ${lastName}`;
    const itemSummaryString = cart.map(item => {
        return item.details.toLowerCase().includes("per plate") ? `${item.quantity}x ${item.title} (${item.details})` : `${item.title} (${item.details})`;
    }).join(", ");

    const newOrderRef = database.ref('orders').push();
    newOrderRef.set({ id: newOrderRef.key, customerName: completeFullName, customerPhone: phone, items: itemSummaryString, status: "PENDING", timestamp: Date.now(), archived: false }).then(() => {
        let trackList = JSON.parse(localStorage.getItem('foodies_tracked_orders') || '[]'); trackList.push(newOrderRef.key); localStorage.setItem('foodies_tracked_orders', JSON.stringify(trackList));
        listenToOrderHistory(); alert("Order dispatched to the kitchen!");
        cart = []; cartBtn.style.display = 'none'; closeCheckout();
        document.getElementById('customer-first-name').value = ''; document.getElementById('customer-last-name').value = ''; document.getElementById('customer-phone').value = '';
    }).catch(() => alert("Error sending order."));
}

// ==========================================================================
// 🚀 8. KITCHEN CONSOLE ENGINE 
// ==========================================================================
function authenticateConsoleAccess() {
    if (isConsoleViewActive) {
        history.replaceState(null, '', window.location.pathname + window.location.search);
        window.location.reload(); 
        return; 
    } 
    if (localStorage.getItem('foodies_console_authenticated') === 'true') { launchConsoleLayout(); return; }
    
    document.getElementById('admin-auth-overlay').style.display = 'block';
    document.getElementById('admin-auth-modal').style.display = 'flex';
    document.getElementById('admin-pin-input').value = ''; document.getElementById('admin-pin-input').focus();
    body.classList.add('stop-scrolling');
}

function closeConsoleAuthModal() {
    document.getElementById('admin-auth-overlay').style.display = 'none';
    document.getElementById('admin-auth-modal').style.display = 'none';
    body.classList.remove('stop-scrolling');
}

function submitConsolePIN() {
    const enteredPassword = document.getElementById('admin-pin-input').value;
    if (enteredPassword === ROUTING_SECRET_PIN) {
        localStorage.setItem('foodies_console_authenticated', 'true');
        closeConsoleAuthModal(); launchConsoleLayout();
    } else { alert("✕ Authentication Failed."); document.getElementById('admin-pin-input').value = ''; }
}

function launchConsoleLayout() {
    isConsoleViewActive = true;
    document.getElementById('customer-view-layout').style.display = 'none';
    if (cartBtn) cartBtn.style.display = 'none';
    document.getElementById('kitchen-view-layout').style.display = 'flex';
    document.getElementById('header-title-text').innerText = "Kitchen Console";
    document.getElementById('view-toggle-action').innerText = "Exit";
    document.getElementById('view-toggle-action').style.backgroundColor = "#DC2626";
    
    const searchBar = document.getElementById('console-search-bar');
    if (searchBar) searchBar.value = '';

    if (window.location.hash !== '#console') history.pushState({ view: 'console' }, 'Console', window.location.pathname + window.location.search + '#console');

    initializeKitchenOrderStream();
    
    const inventoryContainer = document.getElementById('kitchen-inventory-container');
    inventoryContainer.innerHTML = ''; 
    
    const sortedMenu = [...MASTER_MENU].sort((a, b) => {
        const aLive = currentLiveMenuArray.some(m => m.id === a.id);
        const bLive = currentLiveMenuArray.some(m => m.id === b.id);
        if (aLive && !bLive) return -1;
        if (!aLive && bLive) return 1;
        return 0; 
    });

    sortedMenu.forEach((item) => {
        const gridRow = document.createElement('div');
        gridRow.className = "inventory-row";
        gridRow.setAttribute('data-search', `${item.title.toLowerCase()} ${item.category.toLowerCase()}`);
        gridRow.style.cssText = `background-color: #F9FAFB; padding: 14px; border-radius: 14px; border: 1px solid #E5E7EB; display: flex; justify-content: space-between; align-items: center; text-align: left; margin-bottom: 2px;`;

        const liveRec = currentLiveMenuArray.find(m => m.id === item.id);
        const isLive = !!liveRec;
        const isOutOfStock = liveRec ? (liveRec.isOutOfStock === true) : false;

        gridRow.innerHTML = `
            <div style="flex-grow: 1; padding-right: 8px;">
                <div style="font-size: 14px; font-weight: 600; color: #111827;">${item.title}</div>
                <div style="font-size: 11px; color: #6B7280;">${item.category} • ${item.details}</div>
            </div>
            <div style="display: flex; align-items: center; flex-shrink: 0; gap: 12px;">
                <button type="button" id="stock-btn-${item.id}" onclick="toggleLocalStockState(this, '${item.id}')" style="display: ${isLive ? 'block' : 'none'}; background-color: ${isOutOfStock ? '#EF4444' : '#10B981'}; color: white; border: none; padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer; min-width: 95px;">
                    ${isOutOfStock ? 'Out of Stock' : 'In Stock'}
                </button>
                <input type="checkbox" class="console-checkbox" data-id="${item.id}" ${isLive ? 'checked' : ''} onchange="handleCheckboxChange(this, '${item.id}')" style="width: 26px; height: 26px; accent-color: #FF4B3A; cursor: pointer;">
            </div>
        `;
        inventoryContainer.appendChild(gridRow);
    });
}

function filterConsoleMenu() {
    const query = document.getElementById('console-search-bar').value.toLowerCase();
    const rows = document.querySelectorAll('.inventory-row');
    rows.forEach(row => {
        const searchData = row.getAttribute('data-search');
        if (searchData.includes(query)) row.style.display = 'flex';
        else row.style.display = 'none';
    });
}

function handleCheckboxChange(chk, itemId) {
    const index = currentLiveMenuArray.findIndex(m => m.id === itemId);
    if (!chk.checked && index !== -1) {
        const targetItem = MASTER_MENU.find(m => m.id === itemId);
        const confirmRemove = confirm(`⚠️ Remove from Live Menu:\n\nRemove "${targetItem.title}" immediately?`);
        if (confirmRemove) {
            currentLiveMenuArray.splice(index, 1);
            database.ref('daily_live_menu').set(currentLiveMenuArray).then(() => { launchConsoleLayout(); });
        } else { chk.checked = true; }
    }
}

function toggleLocalStockState(btnElement, itemId) {
    const index = currentLiveMenuArray.findIndex(m => m.id === itemId);
    if (index !== -1) {
        const isCurrentlyOut = btnElement.innerText === "Out of Stock";
        const newOutState = !isCurrentlyOut;
        
        const targetItem = MASTER_MENU.find(m => m.id === itemId);
        const statusText = newOutState ? "OUT OF STOCK" : "IN STOCK";
        const confirmChange = confirm(`⚠️ Change Stock Status:\n\nAre you sure you want to mark "${targetItem.title}" as ${statusText}?`);
        if (!confirmChange) return; 
        
        database.ref(`daily_live_menu/${index}`).update({ isOutOfStock: newOutState });
        btnElement.innerText = newOutState ? "Out of Stock" : "In Stock";
        btnElement.style.backgroundColor = newOutState ? "#EF4444" : "#10B981";
        currentLiveMenuArray[index].isOutOfStock = newOutState;
    } else { alert("Please Post Menu first before modifying stock."); }
}

function previewSelectedLiveMenu() {
    const previewList = document.getElementById('menu-preview-list');
    previewList.innerHTML = '';
    pendingLiveArray = []; 

    const allCheckboxes = document.querySelectorAll('.console-checkbox');
    for (let i = 0; i < allCheckboxes.length; i++) {
        if (allCheckboxes[i].checked === true) {
            const itemId = allCheckboxes[i].getAttribute('data-id');
            const item = MASTER_MENU.find(m => m.id === itemId);
            if (item) {
                const liveRec = currentLiveMenuArray.find(m => m.id === itemId);
                const outOfStock = liveRec ? liveRec.isOutOfStock : false;
                pendingLiveArray.push({ id: item.id, title: item.title, details: item.details, category: item.category, isOutOfStock: outOfStock });

                const line = document.createElement('div');
                line.style.cssText = "font-size: 13px; font-weight: 600; color: #111827; display: flex; align-items: center; gap: 6px;";
                line.innerHTML = `<span>🟢</span> ${item.title} <span style="font-size:10px; font-weight:400; color:#6B7280;">(${item.category})</span>`;
                previewList.appendChild(line);
            }
        }
    }

    if (pendingLiveArray.length === 0) { alert("⚠️ Menu empty:\n\nPlease select at least one item before posting today's menu!"); return; }
    document.getElementById('menu-confirm-overlay').style.display = 'block';
    document.getElementById('menu-confirm-modal').style.display = 'flex';
}

function closeMenuConfirmModal() {
    document.getElementById('menu-confirm-overlay').style.display = 'none';
    document.getElementById('menu-confirm-modal').style.display = 'none';
}

function publishSelectedLiveMenu() {
    if (pendingLiveArray.length === 0) return;
    database.ref('daily_live_menu').set(pendingLiveArray)
        .then(() => {
            alert(`🚀 Success!\n\n${pendingLiveArray.length} items successfully published.`);
            closeMenuConfirmModal(); launchConsoleLayout(); 
        }).catch((err) => { alert("Error updating live database nodes."); console.error(err); });
}

// 🚀 FIXED: Added incoming order notification trigger for the Kitchen!
function initializeKitchenOrderStream() {
    const ordersContainer = document.getElementById('kitchen-orders-container');
    let notifiedKitchenOrders = JSON.parse(localStorage.getItem('foodies_kitchen_notified') || '{}');

    database.ref('orders').orderByChild('timestamp').on('value', (snapshot) => {
        if (!isConsoleViewActive) return;
        ordersContainer.innerHTML = '';
        const trackingList = [];
        
        snapshot.forEach((child) => {
            const rawOrder = child.val();
            if (!rawOrder.archived) trackingList.push(rawOrder);
        });

        if (trackingList.length === 0) {
            ordersContainer.innerHTML = '<p style="text-align: center; color: #6B7280; font-size: 13px; margin-top: 20px;">No active orders found today.</p>';
            return;
        }

        trackingList.sort((a, b) => b.timestamp - a.timestamp);
        
        trackingList.forEach((order) => {
            // Check if this is a brand new PENDING order that the kitchen hasn't seen yet
            if (order.status === "PENDING" && !notifiedKitchenOrders[order.id]) {
                triggerInstantNotification(`🔔 New Order from ${order.customerName}!`, 'info');
                notifiedKitchenOrders[order.id] = true;
                localStorage.setItem('foodies_kitchen_notified', JSON.stringify(notifiedKitchenOrders));
            }

            const rowItem = document.createElement('div');
            let statusBadgeColor = "#D97706"; let statusLabel = "PENDING";
            if (order.status === "ACCEPTED") { statusBadgeColor = "#10B981"; statusLabel = "ACCEPTED"; }
            if (order.status === "REJECTED") { statusBadgeColor = "#EF4444"; statusLabel = "REJECTED"; }

            let actionButtonsHTML = '';
            if (order.status === "PENDING" || order.status === "HOLD") {
                actionButtonsHTML = `
                    <button onclick="updateTicketStatus('${order.id}', 'ACCEPTED')" style="flex: 1; background-color: #10B981; color: white; border: none; padding: 8px; border-radius: 8px; font-weight: 600; font-size: 11px; cursor: pointer;">✓ Accept</button>
                    <button onclick="updateTicketStatus('${order.id}', 'REJECTED')" style="flex: 1; background-color: #EF4444; color: white; border: none; padding: 8px; border-radius: 8px; font-weight: 600; font-size: 11px; cursor: pointer;">✕ Reject</button>
                `;
            } else {
                actionButtonsHTML = `
                    <div style="flex: 2; display: flex; align-items: center; justify-content: center; background-color: #F3F4F6; color: #9CA3AF; border-radius: 8px; font-weight: 600; font-size: 11px; padding: 8px;">Processed: ${statusLabel}</div>
                `;
            }

            rowItem.style.cssText = `background-color: #FFFFFF; padding: 14px; border-radius: 14px; box-shadow: 0 4px 10px rgba(0,0,0,0.02); border-left: 5px solid ${statusBadgeColor}; display: flex; flex-direction: column; gap: 8px; margin-bottom: 4px; text-align: left;`;
            rowItem.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div><div style="font-size: 14px; font-weight: 700; color: #111827;">${order.customerName}</div><div style="font-size: 11px; color: #4B5563; font-weight: 500;">📞 ${order.customerPhone}</div></div>
                    <span style="font-size: 10px; font-weight: 700; color: white; background-color: ${statusBadgeColor}; padding: 3px 8px; border-radius: 6px;">${statusLabel}</span>
                </div>
                <div style="font-size: 13px; color: #374151; font-weight: 500; line-height: 1.4; background-color: #F9FAFB; padding: 8px; border-radius: 8px;">${order.items}</div>
                <div style="display: flex; gap: 8px; margin-top: 4px;">
                    ${actionButtonsHTML}
                    <button onclick="archiveTicket('${order.id}')" style="flex: ${order.status === 'PENDING' ? 'initial' : '1'}; background-color: #6B7280; color: white; border: none; padding: 8px 12px; border-radius: 8px; font-weight: 600; font-size: 11px; cursor: pointer;">Archive</button>
                </div>
            `;
            ordersContainer.appendChild(rowItem);
        });
    });
}

function updateTicketStatus(ticketId, targetState) { 
    const doubleCheck = confirm(`Confirm Action:\n\nAre you sure you want to mark this order as ${targetState}?`);
    if(doubleCheck) { database.ref(`orders/${ticketId}`).update({ status: targetState }); }
}

function archiveTicket(ticketId) { database.ref(`orders/${ticketId}`).update({ archived: true }); }

let blackoutStateMemory = isKitchenBlackoutActive();

window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => { if (!installPromptSupported) initNotificationGestureCheck(); }, 2000);
    listenToOrderHistory();
    
    setInterval(() => { 
        const currentlyBlackedOut = isKitchenBlackoutActive();
        if (currentlyBlackedOut !== blackoutStateMemory) {
            blackoutStateMemory = currentlyBlackedOut;
            if (currentlyBlackedOut) enforceBlackoutUILayout();
            else renderCustomerMenu();
        } else if (currentlyBlackedOut) {
            enforceBlackoutUILayout();
        }
    }, 5000);
});

window.addEventListener('popstate', (event) => {
    if (isConsoleViewActive && window.location.hash !== '#console') {
        isConsoleViewActive = false;
        history.replaceState(null, '', window.location.pathname + window.location.search);
        window.location.reload();
    }
});

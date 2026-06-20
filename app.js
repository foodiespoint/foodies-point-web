// ==========================================================================
// 1. PWA REGISTRATION & SCREEN-BLOCKING INSTALL FUNCTIONALITY
// ==========================================================================
let deferredPrompt = null;
let installPromptSupported = false; 

const pwaModal = document.getElementById('pwa-modal');
const pwaOverlay = document.getElementById('pwa-overlay');
const notifModal = document.getElementById('notification-modal');
const notifOverlay = document.getElementById('notification-overlay');
const body = document.body;

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('PWA Service Worker engine running cleanly.'))
            .catch(err => console.error('Worker registration failure:', err));
    });
}

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); 
    deferredPrompt = e;  
    installPromptSupported = true; 
    
    const isAlreadyInstalled = localStorage.getItem('pwa_installed_successfully');
    const pwaLastSeen = localStorage.getItem('pwa_prompt_last_seen');
    const now = new Date().getTime();
    
    if (isAlreadyInstalled !== 'true') {
        if (!pwaLastSeen || (now - pwaLastSeen) > (24 * 60 * 60 * 1000)) {
            showMandatoryModal();
        } else {
            initNotificationGestureCheck(); 
        }
    } else {
        initNotificationGestureCheck(); 
    }
});

function triggerNativeInstall() {
    if (!deferredPrompt) {
        dismissMandatoryModal();
        return;
    }
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
        deferredPrompt = null; 
        dismissMandatoryModal(); 
    });
}

window.addEventListener('appinstalled', (event) => {
    localStorage.setItem('pwa_installed_successfully', 'true');
    dismissMandatoryModal();
});

function showMandatoryModal() {
    if (pwaModal && pwaOverlay) {
        pwaModal.style.display = 'flex';
        pwaOverlay.style.display = 'block';
        body.classList.add('stop-scrolling'); 
        localStorage.setItem('pwa_prompt_last_seen', new Date().getTime()); 
    }
}

function dismissMandatoryModal() {
    if (pwaModal && pwaOverlay) {
        pwaModal.style.display = 'none';
        pwaOverlay.style.display = 'none';
        body.classList.remove('stop-scrolling'); 
        initNotificationGestureCheck();
    }
}

// ==========================================================================
// 2. FIXED CENTERED MANDATORY NOTIFICATION POPUP ENGINE
// ==========================================================================
function initNotificationGestureCheck() {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') return;

    const triggerBlocker = () => {
        if (pwaModal && pwaModal.style.display === 'flex') return;
        if (Notification.permission !== 'granted') {
            showNotificationModal();
        }
    };
    
    window.addEventListener('click', triggerBlocker, { once: true });
    window.addEventListener('touchstart', triggerBlocker, { once: true });
}

function showNotificationModal() {
    if (notifModal && notifOverlay) {
        notifModal.style.display = 'flex';
        notifOverlay.style.display = 'block';
        body.classList.add('stop-scrolling'); 
    }
}

function acceptNotificationModal() {
    if (notifModal && notifOverlay) {
        notifModal.style.display = 'none';
        notifOverlay.style.display = 'none';
        body.classList.remove('stop-scrolling');
    }

    Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
            triggerInstantNotification('🍕 Alerts Enabled! Your live tracking is active.');
        } else {
            initNotificationGestureCheck();
        }
    });
}

function triggerInstantNotification(messageText) {
    if ('Notification' in window && Notification.permission === 'granted') {
        navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification('Foodies Point', {
                body: messageText,
                icon: 'icon.png',
                badge: 'icon.png',
                vibrate: [200, 100, 200],
                tag: 'foodies-point-notification'
            });
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (!installPromptSupported) {
            initNotificationGestureCheck();
        }
    }, 2000);
    
    // Boot up the real-time device history tracking scanner engine
    listenToOrderHistory();
});

// ==========================================
// 3. FIREBASE INITIALIZATION
// ==========================================
const firebaseConfig = {
    databaseURL: "https://foodiespoint-6760-default-rtdb.asia-southeast1.firebasedatabase.app/"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// ==========================================
// 4. MAIN DATA PIPELINES: LIVE MENU CONTROLLER
// ==========================================
const menuContainer = document.getElementById('menu-container');
const cartBtn = document.getElementById('cart-btn');
let cart = [];

database.ref('daily_live_menu').on('value', (snapshot) => {
    menuContainer.innerHTML = ''; 
    const menuItems = [];
    snapshot.forEach((child) => menuItems.push(child.val()));

    if (menuItems.length === 0) {
        menuContainer.innerHTML = '<p style="text-align: center; color: #9CA3AF; margin-top: 20px;">The kitchen has not posted a menu yet today.</p>';
        return;
    }

    menuItems.forEach((item) => {
        const card = document.createElement('div');
        const isStocked = !item.isOutOfStock;
        const opacitySetting = isStocked ? '1.0' : '0.6';
        
        const badgeHTML = isStocked 
            ? `<span style="background-color: #EEF2F6; color: #4B5563; font-size: 10px; font-weight: 600; padding: 4px 8px; border-radius: 6px; letter-spacing: 0.3px; text-transform: uppercase;">${item.category}</span>`
            : `<span style="background-color: #FEE2E2; color: #EF4444; font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 6px; letter-spacing: 0.3px;">OUT OF STOCK</span>`;
            
        const actionButtonHTML = isStocked
            ? `<button onclick="addToCart('${item.id}', '${item.title}', '${item.details}')" style="background-color: #FF4B3A; color: white; padding: 8px 16px; border: none; border-radius: 10px; font-weight: 600; font-size: 13px; cursor: pointer; box-shadow: 0 4px 10px rgba(255, 75, 58, 0.15);">+ Add</button>`
            : `<button disabled style="background-color: #F3F4F6; color: #9CA3AF; padding: 8px 14px; border: none; border-radius: 10px; font-weight: 500; font-size: 13px;">N/A</button>`;

        card.style.cssText = `
            background-color: #FFFFFF;
            padding: 16px;
            border-radius: 18px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
            border: 1px solid #F3F4F6;
            opacity: ${opacitySetting};
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;

        card.innerHTML = `
            <div style="flex-grow: 1; padding-right: 16px;">
                <div style="margin-bottom: 6px; display: inline-block;">${badgeHTML}</div>
                <div style="font-size: 16px; font-weight: 600; color: #111827; letter-spacing: -0.3px; margin-top: 2px;">${item.title}</div>
                <div style="color: #6B7280; font-size: 13px; margin-top: 3px; line-height: 1.4;">${item.details}</div>
            </div>
            <div style="flex-shrink: 0;">${actionButtonHTML}</div>
        `;
        menuContainer.appendChild(card);
    });
});

// ==========================================
// 5. PRESENT DAY REALTIME HISTORY SCANNER MODULE
// ==========================================
function listenToOrderHistory() {
    const historyContainer = document.getElementById('history-container');
    const trackList = JSON.parse(localStorage.getItem('foodies_tracked_orders') || '[]');
    
    if (trackList.length === 0) {
        historyContainer.innerHTML = '<p style="text-align: center; color: #9CA3AF; font-size: 13px; margin-top: 12px;">No orders placed today yet.</p>';
        return;
    }
    
    if (historyContainer.innerHTML.includes("No orders placed today")) {
        historyContainer.innerHTML = '';
    }
    
    // Establish deep individual snapshot nodes for state observation loops
    trackList.forEach(orderId => {
        database.ref(`orders/${orderId}`).on('value', (snapshot) => {
            const order = snapshot.val();
            if (!order) return;
            
            let card = document.getElementById(`history-card-${orderId}`);
            let isNew = false;
            if (!card) {
                card = document.createElement('div');
                card.id = `history-card-${orderId}`;
                isNew = true;
            }
            
            // Map Kitchen Node strings to specified layout badge parameters
            let statusText = "On Hold";
            let badgeColor = "#D97706"; // Default Amber
            let bgColor = "#FEF3C7";
            
            if (order.status === "ACCEPTED") {
                statusText = "Accepted";
                badgeColor = "#059669"; // Emerald Green
                bgColor = "#D1FAE5";
            } else if (order.status === "REJECTED") {
                statusText = "Rejected";
                badgeColor = "#DC2626"; // Crimson Red
                bgColor = "#FEE2E2";
            } else if (order.status === "HOLD" || order.status === "PENDING") {
                statusText = "On Hold";
                badgeColor = "#D97706";
                bgColor = "#FEF3C7";
            }
            
            card.style.cssText = `
                background-color: #F9FAFB;
                padding: 14px;
                border-radius: 14px;
                border: 1px solid #E5E7EB;
                display: flex;
                justify-content: space-between;
                align-items: center;
            `;
            
            card.innerHTML = `
                <div style="flex-grow: 1; padding-right: 12px;">
                    <div style="font-size: 13px; font-weight: 600; color: #111827; line-height: 1.4;">${order.items}</div>
                    <div style="font-size: 11px; color: #9CA3AF; margin-top: 4px;">Ordered at ${new Date(order.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                </div>
                <span style="background-color: ${bgColor}; color: ${badgeColor}; font-size: 11px; font-weight: 700; padding: 6px 12px; border-radius: 20px; text-transform: uppercase; white-space: nowrap; letter-spacing: 0.3px;">
                    ${statusText}
                </span>
            `;
            
            if (isNew) {
                // Prepend to place the most recent orders at the top of the history list
                historyContainer.insertBefore(card, historyContainer.firstChild);
            }
        });
    });
}

// ==========================================
// 6. BASKET ENGINE LOGIC
// ==========================================
function addToCart(id, title, details) {
    const existingItem = cart.find(i => i.id === id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id, title, details, quantity: 1 });
    }
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBtn.style.display = 'block';
    cartBtn.innerText = `View Order (${totalItems} items)`;
}

function openCheckout() {
    document.getElementById('checkout-modal').style.display = 'flex';
    body.classList.add('stop-scrolling'); 
    const summaryDiv = document.getElementById('cart-summary');
    let summaryHTML = '<div style="font-weight: 600; color: #111827; margin-bottom: 8px; font-size: 15px;">Selected Items:</div>';
    cart.forEach(item => { 
        summaryHTML += `<div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>🟢 ${item.title}</span>
            <span style="font-weight: 600; color: #111827;">x${item.quantity}</span>
        </div>`; 
    });
    summaryDiv.innerHTML = summaryHTML;
}

function closeCheckout() { 
    document.getElementById('checkout-modal').style.display = 'none'; 
    body.classList.remove('stop-scrolling'); 
}

// ==========================================
// 7. DOWNSTREAM DATABASE DISPATCH TO KITCHEN
// ==========================================
function submitOrder() {
    const name = document.getElementById('customer-name').value.trim();
    const phone = document.getElementById('customer-phone').value.trim();

    if (name === "" || phone === "") {
        alert("Please enter your name and phone number.");
        return;
    }
    if (cart.length === 0) return;

    const itemSummaryString = cart.map(item => {
        return item.details.toLowerCase().includes("per plate") 
            ? `${item.quantity}x ${item.title} (${item.details})` 
            : `${item.title} (${item.details})`;
    }).join(", ");

    const ordersRef = database.ref('orders');
    const newOrderRef = ordersRef.push();

    const customerPayload = {
        id: newOrderRef.key,
        customerName: name,
        customerPhone: phone,
        items: itemSummaryString,
        status: "PENDING",
        timestamp: Date.now(),
        archived: false
    };

    newOrderRef.set(customerPayload).then(() => {
        // Append unique order key tracking matrix to local storage state
        let trackList = JSON.parse(localStorage.getItem('foodies_tracked_orders') || '[]');
        trackList.push(newOrderRef.key);
        localStorage.setItem('foodies_tracked_orders', JSON.stringify(trackList));
        
        // Re-execute status monitoring loops to render new item instantly
        listenToOrderHistory();

        alert("Order dispatched to the kitchen!");
        cart = [];
        cartBtn.style.display = 'none';
        closeCheckout();
        document.getElementById('customer-name').value = '';
        document.getElementById('customer-phone').value = '';
    }).catch(() => { alert("Error sending order. Try again."); });
}

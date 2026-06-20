// ==========================================================================
// 1. PWA REGISTRATION & SCREEN-BLOCKING INSTALL FUNCTIONALITY
// ==========================================================================
let deferredPrompt = null;
const pwaModal = document.getElementById('pwa-modal');
const pwaOverlay = document.getElementById('pwa-overlay');
const notifModal = document.getElementById('notification-modal');
const notifOverlay = document.getElementById('notification-overlay');
const body = document.body;

// Register the web app's caching engine context
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('PWA Service Worker engine running cleanly.'))
            .catch(err => console.error('Worker registration failure:', err));
    });
}

// Catch the application shortcut token dispatched by the browser shell
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); 
    deferredPrompt = e;  
    
    const isAlreadyInstalled = localStorage.getItem('pwa_installed_successfully');
    const pwaLastSeen = localStorage.getItem('pwa_prompt_last_seen');
    const now = new Date().getTime();
    
    if (isAlreadyInstalled !== 'true') {
        if (!pwaLastSeen || (now - pwaLastSeen) > (24 * 60 * 60 * 1000)) {
            showMandatoryModal();
        }
    }
});

function triggerNativeInstall() {
    if (!deferredPrompt) {
        dismissMandatoryModal();
        return;
    }
    
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
            console.log('App generation pipeline accepted.');
        }
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
        
        // Prepare the notification interceptor right after install modal closes
        initNotificationGestureCheck();
    }
}

// ==========================================================================
// 2. CENTERED MANDATORY NOTIFICATION COERCION ENGINE (FIRST INTERACTION)
// ==========================================================================
function initNotificationGestureCheck() {
    if (!('Notification' in window)) return;

    // If permission is already granted, skip the blocker entirely
    if (Notification.permission === 'granted') return;

    // Set up one-time gesture interception. The absolute millisecond they touch the screen, lock it down!
    const triggerBlocker = () => {
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
        body.classList.add('stop-scrolling'); // Lock screen from closing or bypass scrolling
    }
}

function acceptNotificationModal() {
    // Hide our custom centered layout window structure
    if (notifModal && notifOverlay) {
        notifModal.style.display = 'none';
        notifOverlay.style.display = 'none';
        body.classList.remove('stop-scrolling');
    }

    // Instantly fire the official browser permission prompt using the gesture validation token
    Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
            triggerInstantNotification('🍕 Alerts Enabled! Your live tracking is active.');
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

// If install window wasn't triggered on load, initialize gesture checks instantly
window.addEventListener('DOMContentLoaded', () => {
    const isAlreadyInstalled = localStorage.getItem('pwa_installed_successfully');
    if (isAlreadyInstalled === 'true' || !deferredPrompt) {
        initNotificationGestureCheck();
    }
});

// ==========================================
// 3. FIREBASE INFRASTRUCTURE COMPILATION
// ==========================================
const firebaseConfig = {
    databaseURL: "https://foodiespoint-6760-default-rtdb.asia-southeast1.firebasedatabase.app/"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// ==========================================
// 4. DATA PIPELINES & INTERFACE REFERENCES
// ==========================================
const menuContainer = document.getElementById('menu-container');
const cartBtn = document.getElementById('cart-btn');
let cart = [];

database.ref('daily_live_menu').on('value', (snapshot) => {
    menuContainer.innerHTML = ''; 
    const menuItems = [];
    snapshot.forEach((child) => menuItems.push(child.val()));

    if (menuItems.length === 0) {
        menuContainer.innerHTML = '<p>The kitchen has not posted a menu yet today.</p>';
        return;
    }

    menuItems.forEach((item) => {
        const card = document.createElement('div');
        card.style.backgroundColor = '#FFFFFF';
        card.style.padding = '16px';
        card.style.borderRadius = '16px';
        card.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
        card.style.marginBottom = '12px';
        
        const opacity = item.isOutOfStock ? '0.5' : '1.0';
        const stockStatus = item.isOutOfStock ? '<span style="color: red; font-size: 12px; font-weight: bold;">OUT OF STOCK</span>' : '';
        const buttonHTML = item.isOutOfStock 
            ? `<button disabled style="background-color: #E0E0E0; color: #828282; padding: 8px 16px; border: none; border-radius: 8px; font-weight: bold;">Unavailable</button>`
            : `<button onclick="addToCart('${item.id}', '${item.title}', '${item.details}')" style="background-color: #FF4B3A; color: white; padding: 8px 16px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">+ Add</button>`;

        card.innerHTML = `
            <div style="opacity: ${opacity}; display: flex; justify-content: space-between; align-items: center;">
                <div style="flex-grow: 1; padding-right: 12px;">
                    <div style="color: #FF4B3A; font-size: 10px; font-weight: bold; text-transform: uppercase;">
                        ${item.category} ${stockStatus}
                    </div>
                    <div style="font-size: 16px; font-weight: bold; margin-top: 4px;">${item.title}</div>
                    <div style="color: #828282; font-size: 13px; margin-top: 2px;">${item.details}</div>
                </div>
                <div>${buttonHTML}</div>
            </div>
        `;
        menuContainer.appendChild(card);
    });
});

// ==========================================
// 5. BASKET ENGINE LOGIC
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
    cartBtn.innerText = `View Cart (${totalItems} items)`;
}

function openCheckout() {
    document.getElementById('checkout-modal').style.display = 'flex';
    body.classList.add('stop-scrolling'); 
    const summaryDiv = document.getElementById('cart-summary');
    let summaryHTML = '<strong>Your Items:</strong><br>';
    cart.forEach(item => { summaryHTML += `- ${item.quantity}x ${item.title}<br>`; });
    summaryDiv.innerHTML = summaryHTML;
}

function closeCheckout() { 
    document.getElementById('checkout-modal').style.display = 'none'; 
    body.classList.remove('stop-scrolling'); 
}

// ==========================================
// 6. DOWNSTREAM DATABASE DISPATCH TO KITCHEN
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
        alert("Order dispatched to the kitchen!");
        cart = [];
        cartBtn.style.display = 'none';
        closeCheckout();
        document.getElementById('customer-name').value = '';
        document.getElementById('customer-phone').value = '';
    }).catch(() => { alert("Error sending order. Try again."); });
}

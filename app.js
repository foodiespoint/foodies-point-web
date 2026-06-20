// ==========================================================================
// 1. PWA INITIALIZATION & ROUTING HOOKS
// ==========================================================================
let deferredPrompt = null;
let installPromptSupported = false; // Flag to prevent notification modal overlap

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

// Intercept installation capabilities token cleanly
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); 
    deferredPrompt = e;  
    installPromptSupported = true; // Mark installation system as active
    
    const isAlreadyInstalled = localStorage.getItem('pwa_installed_successfully');
    const pwaLastSeen = localStorage.getItem('pwa_prompt_last_seen');
    const now = new Date().getTime();
    
    if (isAlreadyInstalled !== 'true') {
        if (!pwaLastSeen || (now - pwaLastSeen) > (24 * 60 * 60 * 1000)) {
            showMandatoryModal();
        } else {
            initNotificationGestureCheck(); // Fallback if 24hr rule blocks it
        }
    } else {
        initNotificationGestureCheck(); // Fallback if already running standalone
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
        
        // Pass programmatic execution to notification system cleanly
        initNotificationGestureCheck();
    }
}

// ==========================================================================
// 2. FIXED CENTERED MANDATORY NOTIFICATION POPUP ENGINE
// ==========================================================================
function initNotificationGestureCheck() {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') return;

    // Armed tracking handlers waiting for clean execution
    const triggerBlocker = () => {
        // Double-check safety to ensure install layer isn't open
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
            // Re-arm if they hit block/close so it catches them on the next touch interface interaction
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

// TIMEOUT GATEKEEPER: If beforeinstallprompt hasn't fired in 2 seconds, run notifications
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (!installPromptSupported) {
            initNotificationGestureCheck();
        }
    }, 2000);
});

// ==========================================
// 3. FIREBASE REALTIME DATABASES MODULES
// ==========================================
const firebaseConfig = {
    databaseURL: "https://foodiespoint-6760-default-rtdb.asia-southeast1.firebasedatabase.app/"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// ==========================================
// 4. MAIN DATA PIPELINES & SHOPPING CARTS
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

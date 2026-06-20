// ==========================================================================
// 1. PWA LIFECYCLE HANDSHAKE & SPLASH SCREEN SYSTEM (VERSION 16)
// ==========================================================================
let deferredPrompt = null;
let installPromptSupported = false; 

const pwaModal = document.getElementById('pwa-modal');
const pwaOverlay = document.getElementById('pwa-overlay');
const notifModal = document.getElementById('notification-modal');
const notifOverlay = document.getElementById('notification-overlay');
const body = document.body;

const updateSplash = document.getElementById('update-splash');
const splashText = document.getElementById('splash-text');

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Appending v16 parameters to skip proxy caches cleanly
        navigator.serviceWorker.register('sw.js?v=16')
            .then(reg => {
                console.log('PWA core components initialized.');
                let versionUpgradeDetected = false;

                reg.onupdatefound = () => {
                    if (navigator.serviceWorker.controller) {
                        versionUpgradeDetected = true;
                        if (splashText) {
                            splashText.innerHTML = "New update found!<br><span style='color:#FF4B3A; font-size:14px; font-weight:500;'>Installing assets... Please do not close the app.</span>";
                        }
                    }
                };

                reg.update().then(() => {
                    setTimeout(() => {
                        if (!versionUpgradeDetected) {
                            dismissUpdateSplashScreen();
                        }
                    }, 800);
                }).catch(() => {
                    dismissUpdateSplashScreen();
                });
            })
            .catch(err => {
                console.error('Core lifecycle fault:', err);
                dismissUpdateSplashScreen();
            });
    });

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
            refreshing = true;
            window.location.reload();
        }
    });
} else {
    dismissUpdateSplashScreen();
}

function dismissUpdateSplashScreen() {
    if (updateSplash) {
        updateSplash.style.transition = "opacity 0.4s ease, visibility 0.4s";
        updateSplash.style.opacity = "0";
        updateSplash.style.visibility = "hidden";
        setTimeout(() => { updateSplash.style.display = "none"; }, 400);
    }
}

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); 
    deferredPrompt = e;  
    installPromptSupported = true; 
    
    const isAlreadyInstalled = localStorage.getItem('pwa_installed_successfully');
    if (isAlreadyInstalled !== 'true') {
        showMandatoryModal();
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
// 2. CENTERED MANDATORY NOTIFICATION POPUP ENGINE
// ==========================================================================
function initNotificationGestureCheck() {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') return;

    const triggerBlocker = () => {
        if (pwaModal && pwaModal.style.display === 'flex') return;
        if (updateSplash && updateSplash.style.display !== 'none') return;
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

// ==========================================
// 3. FIREBASE INITIALIZATION
// ==========================================
const firebaseConfig = {
    databaseURL: "https://foodiespoint-6760-default-rtdb.asia-southeast1.firebasedatabase.app/"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// ==========================================
// 4. BULLETPROOF IST TIMEZONE LOCKOUT ENGINE
// ==========================================
function isKitchenBlackoutActive() {
    const now = new Date();
    
    const istFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    
    const istTimeParts = istFormatter.format(now).split(':');
    const currentHour = parseInt(istTimeParts[0], 10);
    const currentMinute = parseInt(istTimeParts[1], 10);
    
    const totalMinutesPassed = (currentHour * 60) + currentMinute;
    
    const lockStartMinutes = 18 * 60;          // 18:00 (6:00 PM)
    const lockReleaseMinutes = (21 * 60) + 30;    // 21:30 (9:30 PM)
    
    return (totalMinutesPassed >= lockStartMinutes && totalMinutesPassed < lockReleaseMinutes);
}

function enforceBlackoutUILayout() {
    // 🚀 SAFETY CHECK: Do not override layout structures if the active session is viewing the console panel
    if (isConsoleViewActive) return;

    const historyContainer = document.getElementById('history-container');
    localStorage.removeItem('foodies_tracked_orders');
    cart = [];
    if (cartBtn) cartBtn.style.display = 'none';
    
    menuContainer.innerHTML = `
        <div style="text-align: center; padding: 32px 16px; background-color: #FFFFFF; border-radius: 18px; border: 1px dashed #E5E7EB; width: 100%; box-sizing: border-box;">
            <div style="font-size: 32px; margin-bottom: 8px;">⏰</div>
            <div style="font-weight: 700; font-size: 15px; color: #111827;">Kitchen Closed for Today</div>
            <div style="color: #6B7280; font-size: 13px; margin-top: 4px; line-height: 1.5;">Tomorrow's live menu will be available after 9:30 PM IST.</div>
        </div>
    `;
    
    if (historyContainer) {
        historyContainer.innerHTML = `
            <p style="text-align: center; color: #9CA3AF; font-size: 13px; margin-top: 12px; font-style: italic;">
                History cleared for the day.
            </p>
        `;
    }
}

// ==========================================
// 5. MAIN DATA PIPELINES: LIVE MENU CONTROLLER
// ==========================================
const menuContainer = document.getElementById('menu-container');
const cartBtn = document.getElementById('cart-btn');
let cart = [];

database.ref('daily_live_menu').on('value', (snapshot) => {
    if (isKitchenBlackoutActive()) {
        enforceBlackoutUILayout();
        return;
    }

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
// 6. PRESENT DAY REALTIME HISTORY SCANNER MODULE
// ==========================================
function listenToOrderHistory() {
    if (isKitchenBlackoutActive()) {
        enforceBlackoutUILayout();
        return;
    }

    const historyContainer = document.getElementById('history-container');
    const trackList = JSON.parse(localStorage.getItem('foodies_tracked_orders') || '[]');
    
    if (trackList.length === 0) {
        historyContainer.innerHTML = '<p style="text-align: center; color: #9CA3AF; font-size: 13px; margin-top: 12px;">No orders placed today yet.</p>';
        return;
    }
    
    if (historyContainer.innerHTML.includes("No orders placed today") || historyContainer.innerHTML.includes("History cleared")) {
        historyContainer.innerHTML = '';
    }
    
    trackList.forEach(orderId => {
        database.ref(`orders/${orderId}`).on('value', (snapshot) => {
            if (isKitchenBlackoutActive() || isConsoleViewActive) return; 
            
            const order = snapshot.val();
            if (!order) return;
            
            let card = document.getElementById(`history-card-${orderId}`);
            let isNew = false;
            if (!card) {
                card = document.createElement('div');
                card.id = `history-card-${orderId}`;
                isNew = true;
            }
            
            let statusText = "On Hold";
            let badgeColor = "#D97706"; 
            let bgColor = "#FEF3C7";
            
            if (order.status === "ACCEPTED") {
                statusText = "Accepted";
                badgeColor = "#059669"; 
                bgColor = "#D1FAE5";
            } else if (order.status === "REJECTED") {
                statusText = "Rejected";
                badgeColor = "#DC2626"; 
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
                historyContainer.insertBefore(card, historyContainer.firstChild);
            }
        });
    });
}

// ==========================================
// 7. BASKET ENGINE LOGIC
// ==========================================
function addToCart(id, title, details) {
    if (isKitchenBlackoutActive()) {
        alert("The kitchen is currently closed. Orders cannot be added.");
        return;
    }
    const existingItem = cart.find(i => i.id === id);
    
    if (details.toLowerCase().includes("per plate")) {
        if (existingItem && existingItem.quantity >= 5) {
            alert(`⚠️ Order Limit Exceeded:\n\nYou can only order a maximum of 5 plates for ${title} per single dispatch!`);
            return; 
        }
    }

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
    if (isKitchenBlackoutActive()) return;
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
// 8. DOWNSTREAM DATABASE DISPATCH TO KITCHEN
// ==========================================
function submitOrder() {
    if (isKitchenBlackoutActive()) {
        alert("The kitchen is currently closed for the day.");
        return;
    }
    const firstName = document.getElementById('customer-first-name').value.trim();
    const lastName = document.getElementById('customer-last-name').value.trim();
    const phone = document.getElementById('customer-phone').value.trim();

    if (firstName === "" || lastName === "") {
        alert("Please enter both your First Name and Last Name.");
        return;
    }
    if (phone === "" || phone.length !== 10) {
        alert("Please enter a valid 10-digit mobile number.");
        return;
    }
    if (cart.length === 0) return;

    const completeFullName = `${firstName} ${lastName}`;
    const itemSummaryString = cart.map(item => {
        return item.details.toLowerCase().includes("per plate") 
            ? `${item.quantity}x ${item.title} (${item.details})` 
            : `${item.title} (${item.details})`;
    }).join(", ");

    const ordersRef = database.ref('orders');
    const newOrderRef = ordersRef.push();

    const customerPayload = {
        id: newOrderRef.key,
        customerName: completeFullName,
        customerPhone: phone,
        items: itemSummaryString,
        status: "PENDING",
        timestamp: Date.now(),
        archived: false
    };

    newOrderRef.set(customerPayload).then(() => {
        let trackList = JSON.parse(localStorage.getItem('foodies_tracked_orders') || '[]');
        trackList.push(newOrderRef.key);
        localStorage.setItem('foodies_tracked_orders', JSON.stringify(trackList));
        
        listenToOrderHistory();

        alert("Order dispatched to the kitchen!");
        cart = [];
        cartBtn.style.display = 'none';
        closeCheckout();
        
        document.getElementById('customer-first-name').value = '';
        document.getElementById('customer-last-name').value = '';
        document.getElementById('customer-phone').value = '';
    }).catch(() => { alert("Error sending order. Try again."); });
}

// ==========================================================================
// 🚀 9. NEW: ADMINISTRATIVE KITCHEN CONSOLE OPERATIONS ENGINE
// ==========================================================================
let isConsoleViewActive = false;
const ROUTING_SECRET_PIN = "1234"; 

function authenticateConsoleAccess() {
    // If already inside the panel view layer, clicking exit behaves as a reversal toggle switch
    if (isConsoleViewActive) {
        isConsoleViewActive = false;
        document.getElementById('kitchen-view-layout').style.display = 'none';
        document.getElementById('customer-view-layout').style.display = 'flex';
        document.getElementById('header-title-text').innerText = "Foodies Point";
        document.getElementById('view-toggle-action').innerText = "Console";
        document.getElementById('view-toggle-action').style.backgroundColor = "rgba(255,255,255,0.2)";
        
        // Re-evaluate client data states
        if (isKitchenBlackoutActive()) {
            enforceBlackoutUILayout();
        } else {
            window.location.reload(); 
        }
        return;
    }

    const verificationInput = prompt("🔑 Access Authorization Required:\n\nPlease enter the Kitchen Console PIN:");
    if (verificationInput === null) return; 

    if (verificationInput === ROUTING_SECRET_PIN) {
        isConsoleViewActive = true;
        document.getElementById('customer-view-layout').style.display = 'none';
        if (cartBtn) cartBtn.style.display = 'none';
        
        document.getElementById('kitchen-view-layout').style.display = 'flex';
        document.getElementById('header-title-text').innerText = "Kitchen Console";
        document.getElementById('view-toggle-action').innerText = "Exit";
        document.getElementById('view-toggle-action').style.backgroundColor = "#DC2626";
        
        // Open live admin sync pipelines
        initializeKitchenOrderStream();
        initializeKitchenInventoryMatrix();
    } else {
        alert("❌ Authentication Failed: Invalid authorization token provided.");
    }
}

// Sub-Module A: Master Realtime Order Management Pipeline
function initializeKitchenOrderStream() {
    const ordersContainer = document.getElementById('kitchen-orders-container');
    
    database.ref('orders').orderByChild('timestamp').on('value', (snapshot) => {
        if (!isConsoleViewActive) return;
        ordersContainer.innerHTML = '';
        
        const trackingList = [];
        snapshot.forEach((child) => {
            const rawOrder = child.val();
            if (!rawOrder.archived) {
                trackingList.push(rawOrder);
            }
        });

        if (trackingList.length === 0) {
            ordersContainer.innerHTML = '<p style="text-align: center; color: #6B7280; font-size: 13px; margin-top: 20px;">No active orders found today.</p>';
            return;
        }

        // Sort descending to keep newest tickets at top
        trackingList.sort((a, b) => b.timestamp - a.timestamp);

        trackingList.forEach((order) => {
            const rowItem = document.createElement('div');
            
            let statusBadgeColor = "#D97706";
            let statusLabel = "PENDING";
            if (order.status === "ACCEPTED") { statusBadgeColor = "#10B981"; statusLabel = "ACCEPTED"; }
            if (order.status === "REJECTED") { statusBadgeColor = "#EF4444"; statusLabel = "REJECTED"; }

            rowItem.style.cssText = `
                background-color: #FFFFFF; padding: 14px; border-radius: 14px;
                box-shadow: 0 4px 10px rgba(0,0,0,0.02); border-left: 5px solid ${statusBadgeColor};
                display: flex; flex-direction: column; gap: 8px;
            `;

            rowItem.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <div style="font-size: 14px; font-weight: 700; color: #111827;">${order.customerName}</div>
                        <div style="font-size: 11px; color: #4B5563; font-weight: 500;">📞 ${order.customerPhone}</div>
                    </div>
                    <span style="font-size: 10px; font-weight: 700; color: white; background-color: ${statusBadgeColor}; padding: 3px 8px; border-radius: 6px;">${statusLabel}</span>
                </div>
                <div style="font-size: 13px; color: #374151; font-weight: 500; line-height: 1.4; background-color: #F9FAFB; padding: 8px; border-radius: 8px;">
                    ${order.items}
                </div>
                <div style="display: flex; gap: 8px; margin-top: 4px;">
                    <button onclick="updateTicketStatus('${order.id}', 'ACCEPTED')" style="flex: 1; background-color: #10B981; color: white; border: none; padding: 8px; border-radius: 8px; font-weight: 600; font-size: 11px; cursor: pointer;">✓ Accept</button>
                    <button onclick="updateTicketStatus('${order.id}', 'REJECTED')" style="flex: 1; background-color: #EF4444; color: white; border: none; padding: 8px; border-radius: 8px; font-weight: 600; font-size: 11px; cursor: pointer;">✕ Reject</button>
                    <button onclick="archiveTicket('${order.id}')" style="background-color: #6B7280; color: white; border: none; padding: 8px 12px; border-radius: 8px; font-weight: 600; font-size: 11px; cursor: pointer;">Archive</button>
                </div>
            `;
            ordersContainer.appendChild(rowItem);
        });
    });
}

function updateTicketStatus(ticketId, targetState) {
    database.ref(`orders/${ticketId}`).update({ status: targetState })
        .catch(() => alert("Network transmission failure updating database node state."));
}

function archiveTicket(ticketId) {
    database.ref(`orders/${ticketId}`).update({ archived: true })
        .catch(() => alert("Failed to archive target order file."));
}

// Sub-Module B: Master Menu Inventory Availablity Management Pipeline
function initializeKitchenInventoryMatrix() {
    const inventoryContainer = document.getElementById('kitchen-inventory-container');
    
    database.ref('daily_live_menu').on('value', (snapshot) => {
        if (!isConsoleViewActive) return;
        inventoryContainer.innerHTML = '';
        
        snapshot.forEach((child) => {
            const item = child.val();
            const gridRow = document.createElement('div');
            
            const isInStock = !item.isOutOfStock;
            const contextBtnLabel = isInStock ? "In Stock" : "Out of Stock";
            const contextBtnColor = isInStock ? "#10B981" : "#EF4444";

            gridRow.style.cssText = `
                background-color: #F9FAFB; padding: 12px; border-radius: 12px;
                border: 1px solid #E5E7EB; display: flex; justify-content: space-between; align-items: center;
            `;

            gridRow.innerHTML = `
                <div>
                    <div style="font-size: 14px; font-weight: 600; color: #111827;">${item.title}</div>
                    <div style="font-size: 11px; color: #6B7280;">${item.category} • ${item.details}</div>
                </div>
                <button onclick="toggleItemStockState('${item.id}', ${item.isOutOfStock || false})" style="background-color: ${contextBtnColor}; color: white; border: none; padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer; min-width: 100px;">
                    ${contextBtnLabel}
                </button>
            `;
            inventoryContainer.appendChild(gridRow);
        });
    });
}

function toggleItemStockState(itemId, currentFlagValue) {
    database.ref(`daily_live_menu/${itemId}`).update({ isOutOfStock: !currentFlagValue })
        .catch(() => alert("Failed to mutate current target inventory flag data."));
}

// Global Startup Core Execution Handlers
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (!installPromptSupported) {
            initNotificationGestureCheck();
        }
    }, 2000);
    
    listenToOrderHistory();
    
    setInterval(() => {
        if (isKitchenBlackoutActive()) {
            enforceBlackoutUILayout();
        }
    }, 30000);
});

import React, { createContext, useContext, useState, useEffect } from 'react';

const POSContext = createContext();

export const usePOS = () => {
    const context = useContext(POSContext);
    if (!context) {
        throw new Error('usePOS must be used within a POSProvider');
    }
    return context;
};

export const POSProvider = ({ children }) => {
    const [invoiceTabs, setInvoiceTabs] = useState([
        {
            id: Date.now(),
            customer: null,
            cartItems: [],
            notes: '',
            heldAt: null,
            status: 'active'
        }
    ]);
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    // Persist to local storage? Maybe later. 
    // Let's keep it in memory for now as per design "multi-tab" often means current session.

    const activeTab = invoiceTabs[activeTabIndex];

    const addNewTab = () => {
        const newTab = {
            id: Date.now(),
            customer: null,
            cartItems: [],
            notes: '',
            heldAt: null,
            status: 'active'
        };
        setInvoiceTabs([...invoiceTabs, newTab]);
        setActiveTabIndex(invoiceTabs.length);
    };

    const closeTab = (index) => {
        if (invoiceTabs.length === 1) {
            // Last tab, just clear it
            setInvoiceTabs([{
                id: Date.now(),
                customer: null,
                cartItems: [],
                notes: '',
                heldAt: null,
                status: 'active'
            }]);
            setActiveTabIndex(0);
            return;
        }

        const newTabs = invoiceTabs.filter((_, i) => i !== index);
        setInvoiceTabs(newTabs);
        
        if (activeTabIndex >= newTabs.length) {
            setActiveTabIndex(newTabs.length - 1);
        } else if (activeTabIndex === index && index > 0) {
            setActiveTabIndex(index - 1);
        }
    };

    const updateActiveTab = (updates) => {
        const newTabs = [...invoiceTabs];
        newTabs[activeTabIndex] = { ...newTabs[activeTabIndex], ...updates };
        setInvoiceTabs(newTabs);
    };

    const addItem = (product) => {
        const currentCart = [...activeTab.cartItems];
        const existingIdx = currentCart.findIndex(item => item.product_id === product.id);

        if (existingIdx > -1) {
            currentCart[existingIdx].quantity += 1;
        } else {
            currentCart.push({
                product_id: product.id,
                product_name: product.name,
                product_variant: product.variant,
                product_sku: product.sku,
                is_service: product.is_service,
                quantity: 1,
                unit_price: product.price,
                discount_type: 'none',
                discount_value: 0,
                gift_wrap: false,
                is_accessory: product.is_accessory
            });
        }

        updateActiveTab({ cartItems: currentCart });
    };

    const removeItem = (productId) => {
        const newCart = activeTab.cartItems.filter(item => item.product_id !== productId);
        updateActiveTab({ cartItems: newCart });
    };

    const updateQty = (productId, delta) => {
        const newCart = activeTab.cartItems.map(item => {
            if (item.product_id === productId) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        });
        updateActiveTab({ cartItems: newCart });
    };

    const updateItemDiscount = (productId, type, value) => {
        const newCart = activeTab.cartItems.map(item => {
            if (item.product_id === productId) {
                return { ...item, discount_type: type, discount_value: parseFloat(value) || 0 };
            }
            return item;
        });
        updateActiveTab({ cartItems: newCart });
    };

    const toggleGiftWrap = (productId) => {
        const newCart = activeTab.cartItems.map(item => {
            if (item.product_id === productId && item.is_accessory) {
                return { ...item, gift_wrap: !item.gift_wrap };
            }
            return item;
        });
        updateActiveTab({ cartItems: newCart });
    };

    const attachCustomer = (customer) => {
        updateActiveTab({ customer });
    };

    const clearInvoice = () => {
        updateActiveTab({
            customer: null,
            cartItems: [],
            notes: '',
            heldAt: null,
            status: 'active'
        });
    };

    const holdInvoice = () => {
        if (activeTab.cartItems.length === 0 && !activeTab.customer) return;
        
        updateActiveTab({ status: 'held', heldAt: new Date() });
        addNewTab(); // Automatically open a new tab after holding
    };

    const value = {
        invoiceTabs,
        activeTabIndex,
        setActiveTabIndex,
        activeTab,
        addNewTab,
        closeTab,
        addItem,
        removeItem,
        updateQty,
        updateItemDiscount,
        toggleGiftWrap,
        attachCustomer,
        clearInvoice,
        holdInvoice,
        isHistoryOpen,
        setIsHistoryOpen
    };

    return <POSContext.Provider value={value}>{children}</POSContext.Provider>;
};

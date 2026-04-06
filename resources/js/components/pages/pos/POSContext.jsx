import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

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
            note: '',
            heldAt: null,
            status: 'active',
            payments: []
        }
    ]);
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isServiceOpen, setIsServiceOpen] = useState(false);

    // Persist to local storage? Maybe later. 
    // Let's keep it in memory for now as per design "multi-tab" often means current session.

    const activeTab = invoiceTabs[activeTabIndex];

    const addNewTab = () => {
        const newTab = {
            id: Date.now(),
            customer: null,
            cartItems: [],
            notes: '',
            note: '',
            heldAt: null,
            status: 'active',
            payments: []
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

    const addItems = (products) => {
        setInvoiceTabs(prevTabs => {
            const nextTabs = [...prevTabs];
            const tab = { ...nextTabs[activeTabIndex] };
            const currentCart = [...tab.cartItems];

            products.forEach(product => {
                const existingIdx = !product.is_service 
                    ? currentCart.findIndex(item => item.product_id === product.id)
                    : -1; // Services NEVER stack, always add as new "Add-on" row

                if (existingIdx > -1) {
                    currentCart[existingIdx] = {
                        ...currentCart[existingIdx],
                        quantity: currentCart[existingIdx].quantity + 1
                    };
                } else {
                    currentCart.push({
                        cart_item_id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
            });

            tab.cartItems = currentCart;
            nextTabs[activeTabIndex] = tab;
            return nextTabs;
        });
    };

    const addItem = (product) => {
        addItems([product]);
    };

    const removeItem = (cartItemId) => {
        const newCart = activeTab.cartItems.filter(item => item.cart_item_id !== cartItemId);
        updateActiveTab({ cartItems: newCart });
    };

    const updateQty = (cartItemId, delta) => {
        const newCart = activeTab.cartItems.map(item => {
            if (item.cart_item_id === cartItemId) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        });
        updateActiveTab({ cartItems: newCart });
    };

    const updateItemDiscount = (cartItemId, type, value) => {
        const newCart = activeTab.cartItems.map(item => {
            if (item.cart_item_id === cartItemId) {
                return { ...item, discount_type: type, discount_value: parseFloat(value) || 0 };
            }
            return item;
        });
        updateActiveTab({ cartItems: newCart });
    };

    const toggleGiftWrap = (cartItemId) => {
        const newCart = activeTab.cartItems.map(item => {
            if (item.cart_item_id === cartItemId && item.is_accessory) {
                return { ...item, gift_wrap: !item.gift_wrap };
            }
            return item;
        });
        updateActiveTab({ cartItems: newCart });
    };

    const attachCustomer = (customer) => {
        updateActiveTab({ customer });
    };

    const updateNote = (note) => {
        updateActiveTab({ note });
    };

    const clearInvoice = () => {
        updateActiveTab({
            customer: null,
            cartItems: [],
            notes: '',
            heldAt: null,
            status: 'active',
            payments: []
        });
    };

    const holdInvoice = () => {
        if (activeTab.cartItems.length === 0 && !activeTab.customer) return;
        
        updateActiveTab({ status: 'held', heldAt: new Date() });
        addNewTab(); // Automatically open a new tab after holding
    };

    const updatePayments = (payments) => {
        updateActiveTab({ payments });
    };

    // Centralized Totals Calculation
    const totals = useMemo(() => {
        if (!activeTab) return { subtotal: 0, productSubtotal: 0, serviceSubtotal: 0, productSubtotalForDiscount: 0, tierDiscountPercent: 0, tierDiscountAmount: 0, finalTotal: 0 };
        
        let productSubtotal = 0;
        let serviceSubtotal = 0;
        let productSubtotalForDiscountThreshold = 0;
        
        activeTab.cartItems.forEach(item => {
            const itemTotal = item.unit_price * item.quantity;
            let finalPrice = itemTotal;

            // Only apply individual discounts to regular products, NEVER services
            if (!item.is_service) {
                if (item.discount_type === 'percentage') {
                    finalPrice = itemTotal * (1 - item.discount_value / 100);
                } else if (item.discount_type === 'price') {
                    finalPrice = itemTotal - item.discount_value;
                }
            }

            const processedPrice = Math.max(0, finalPrice);
            
            if (!!item.is_service) {
                serviceSubtotal += itemTotal; // Services are always added at their full unit price * quantity
            } else {
                productSubtotal += processedPrice;
                // Threshold based on the net product subtotal (after item-level discounts)
                productSubtotalForDiscountThreshold += processedPrice;
            }
        });

        // Determine Tier Discount Percent (Products only)
        let tierDiscountPercent = 0;
        if (productSubtotalForDiscountThreshold >= 1500) tierDiscountPercent = 15;
        else if (productSubtotalForDiscountThreshold >= 1000) tierDiscountPercent = 10;
        else if (productSubtotalForDiscountThreshold >= 500) tierDiscountPercent = 8;

        const tierDiscountAmount = productSubtotal * (tierDiscountPercent / 100);
        
        // Final Total: Product Subtotal (net of tier discount) + Service Add-ons
        const finalTotal = (productSubtotal - tierDiscountAmount) + serviceSubtotal;

        const currentPaid = (activeTab?.payments || []).reduce((sum, p) => sum + p.amount, 0);
        const changeDue = Math.max(0, currentPaid - finalTotal);

        return {
            subtotal: productSubtotal + serviceSubtotal,
            productSubtotal,
            serviceSubtotal,
            productSubtotalForDiscount: productSubtotalForDiscountThreshold,
            tierDiscountPercent,
            tierDiscountAmount,
            finalTotal,
            currentPaid,
            changeDue
        };
    }, [activeTab.cartItems, activeTab.payments]);

    const value = {
        invoiceTabs,
        activeTabIndex,
        setActiveTabIndex,
        activeTab,
        totals,
        addNewTab,
        closeTab,
        addItem,
        addItems,
        removeItem,
        updateQty,
        updateItemDiscount,
        toggleGiftWrap,
        attachCustomer,
        updateNote,
        updatePayments,
        clearInvoice,
        holdInvoice,
        isHistoryOpen,
        setIsHistoryOpen,
        isServiceOpen,
        setIsServiceOpen
    };

    return <POSContext.Provider value={value}>{children}</POSContext.Provider>;
};

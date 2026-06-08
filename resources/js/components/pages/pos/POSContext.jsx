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
            payments: [],
            cartDiscount: { type: 'percentage', value: 0 }
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
            payments: [],
            cartDiscount: { type: 'percentage', value: 0 }
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
                status: 'active',
                cartDiscount: { type: 'percentage', value: 0 }
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
            // Use prevTabs.length - 1 to get the last tab (current active) in case index is stale
            const activeIdx = prevTabs.length - 1;
            const tab = { ...nextTabs[activeIdx] };
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
            nextTabs[activeIdx] = tab;
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
                // If in refund mode, allow 0 min and enforce max_quantity cap
                const min = activeTab.isRefundMode ? 0 : 1;
                const max = activeTab.isRefundMode ? (item.max_quantity || item.quantity) : Infinity;
                
                const newQty = Math.max(min, Math.min(max, item.quantity + delta));
                return { ...item, quantity: newQty };
            }
            return item;
        });
        updateActiveTab({ cartItems: newCart });
    };

    const selectAllRefundItems = () => {
        if (!activeTab.isRefundMode) return;
        const newCart = activeTab.cartItems.map(item => ({
            ...item,
            quantity: item.max_quantity
        }));
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

    const updateItemPrice = (cartItemId, newPrice) => {
        const newCart = activeTab.cartItems.map(item => {
            if (item.cart_item_id === cartItemId) {
                return { ...item, unit_price: parseFloat(newPrice) || 0 };
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

    const updateItemAttribute = (cartItemId, key, value) => {
        const newCart = activeTab.cartItems.map(item => {
            if (item.cart_item_id === cartItemId) {
                return { ...item, [key]: value };
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
            note: '',
            heldAt: null,
            status: 'active',
            payments: [],
            isRefundMode: false,
            originalInvoice: null,
            cartDiscount: { type: 'percentage', value: 0 }
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

    const updateCartDiscount = (type, value) => {
        updateActiveTab({ cartDiscount: { type, value: parseFloat(value) || 0 } });
    };

    // Centralized Totals Calculation
    const totals = useMemo(() => {
        if (!activeTab) return { subtotal: 0, productSubtotal: 0, serviceSubtotal: 0, manualDiscountAmount: 0, finalTotal: 0 };
        
        let productSubtotal = 0;
        let serviceSubtotal = 0;
        
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
            }
        });

        // Manual cart-level discount (applied to products only)
        const cartDiscount = activeTab.cartDiscount || { type: 'percentage', value: 0 };
        let manualDiscountAmount = 0;
        if (cartDiscount.value > 0) {
            if (cartDiscount.type === 'percentage') {
                manualDiscountAmount = productSubtotal * (cartDiscount.value / 100);
            } else {
                manualDiscountAmount = Math.min(cartDiscount.value, productSubtotal);
            }
        }
        
        // Final Total: Product Subtotal (net of manual discount) + Service Add-ons
        const finalTotal = Math.max(0, (productSubtotal - manualDiscountAmount) + serviceSubtotal);

        const currentPaid = (activeTab?.payments || []).reduce((sum, p) => sum + p.amount, 0);
        const changeDue = Math.max(0, currentPaid - finalTotal);
        const remaining = Math.max(0, finalTotal - currentPaid);

        return {
            subtotal: productSubtotal + serviceSubtotal,
            productSubtotal,
            serviceSubtotal,
            manualDiscountAmount,
            cartDiscountType: cartDiscount.type,
            cartDiscountValue: cartDiscount.value,
            finalTotal,
            currentPaid,
            changeDue,
            remaining
        };
    }, [activeTab.cartItems, activeTab.payments, activeTab.cartDiscount]);

    const loadInvoiceIntoCart = (invoice) => {
        const newTab = {
            id: Date.now(),
            customer: invoice.customer,
            cartItems: invoice.items.map(item => {
                const pastRefundedQty = (item.refunds || []).reduce((sum, r) => sum + (r.quantity || 0), 0);
                const remainingQty = Math.max(0, item.quantity - pastRefundedQty);
                
                return {
                    cart_item_id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    original_item_id: item.id,
                    product_id: item.product_id,
                    product_name: item.product_name,
                    product_variant: item.product_variant,
                    product_sku: item.product_sku,
                    is_service: !!item.is_service,
                    quantity: 0, 
                    max_quantity: remainingQty,
                    past_refunded_qty: pastRefundedQty,
                    is_fully_refunded: remainingQty <= 0,
                    total_original_qty: item.quantity,
                    unit_price: item.unit_price,
                    discount_type: item.discount_type === 'percent' ? 'percentage' : (item.discount_type === 'amount' ? 'price' : 'none'),
                    discount_value: item.discount_value,
                    gift_wrap: !!item.gift_wrap,
                    is_accessory: false
                };
            }),
            notes: `REFUND: ${invoice.invoice_number}`,
            note: `REFUND: ${invoice.invoice_number}`,
            isRefundMode: true,
            originalInvoice: invoice,
            // Inherit original tier discount if it was a VIP/tier discount
            cartDiscount: {
                type: 'percentage',
                value: parseFloat(invoice.tier_discount_pct || 0),
            },
            heldAt: null,
            status: 'active',
            payments: []
        };
        setInvoiceTabs(prev => [...prev, newTab]);
        setActiveTabIndex(invoiceTabs.length);
    };

    const cloneInvoiceIntoCart = (invoice) => {
        const newTab = {
            id: Date.now(),
            customer: invoice.customer,
            cartItems: invoice.items.map(item => ({
                cart_item_id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                product_id: item.product_id,
                product_name: item.product_name,
                product_variant: item.product_variant,
                product_sku: item.product_sku,
                is_service: !!item.is_service,
                quantity: item.quantity, 
                unit_price: item.unit_price,
                discount_type: item.discount_type === 'percent' ? 'percentage' : (item.discount_type === 'amount' ? 'price' : 'none'),
                discount_value: item.discount_value,
                gift_wrap: !!item.gift_wrap,
                is_accessory: false
            })),
            notes: `CLONED FROM: ${invoice.invoice_number}`,
            note: `CLONED FROM: ${invoice.invoice_number}`,
            isRefundMode: false,
            originalInvoice: null,
            heldAt: null,
            status: 'active',
            payments: []
        };
        setInvoiceTabs(prev => [...prev, newTab]);
        setActiveTabIndex(invoiceTabs.length); // Assuming this triggers length change immediately or use callback state
    };

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
        updateItemPrice,
        updateItemAttribute,
        updateCartDiscount,
        toggleGiftWrap,
        attachCustomer,
        updateNote,
        updatePayments,
        clearInvoice,
        holdInvoice,
        loadInvoiceIntoCart,
        cloneInvoiceIntoCart,
        selectAllRefundItems,
        isHistoryOpen,
        setIsHistoryOpen,
        isServiceOpen,
        setIsServiceOpen
    };

    return <POSContext.Provider value={value}>{children}</POSContext.Provider>;
};

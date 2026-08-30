const DEFAULT_LABEL_PRINT_CONFIG = {
    label: {
        widthMm: 32,
        heightMm: 22,
        labelsPerRow: 2,
        gutterMm: 2,
        paddingX: '1.2mm',
        paddingY: '1.0mm',
        gap: '0.5mm',
        name: '3.1mm',
        variant: '1.2mm',
        sku: '1.5mm',
        price: '4.0mm',
        priceCurrency: '2.2mm',
        barcodeHeight: '7.6mm',
        priceRuleWidth: '0mm',
    },
    print: {
        defaultCopies: 1,
        maxCopies: 99,
        margins: 'None',
        scale: '100%',
        actualSizeText: 'Actual size',
    },
};

const mergeDeep = (...objects) => {
    const result = {};

    for (const obj of objects) {
        if (!obj || typeof obj !== 'object') continue;

        for (const [key, value] of Object.entries(obj)) {
            if (value && typeof value === 'object' && !Array.isArray(value) && typeof result[key] === 'object' && !Array.isArray(result[key])) {
                result[key] = mergeDeep(result[key], value);
            } else {
                result[key] = value;
            }
        }
    }

    return result;
};

const safeReadStorage = (key) => {
    if (typeof window === 'undefined' || !window.localStorage) return {};

    try {
        const raw = window.localStorage.getItem(key);
        return raw ? JSON.parse(raw) : {};
    } catch (error) {
        console.warn('[labelPrintConfig] Failed to read saved config:', error);
        return {};
    }
};

export const getLabelPrintConfig = () => {
    const injected = typeof window !== 'undefined' ? (window.__LABEL_PRINT_CONFIG__ || {}) : {};
    const saved = safeReadStorage('label_print_config');
    return mergeDeep(DEFAULT_LABEL_PRINT_CONFIG, injected, saved);
};

export const setLabelPrintConfig = (nextConfig) => {
    if (typeof window === 'undefined' || !window.localStorage) {
        return getLabelPrintConfig();
    }

    const merged = mergeDeep(DEFAULT_LABEL_PRINT_CONFIG, nextConfig);
    window.localStorage.setItem('label_print_config', JSON.stringify(merged));
    return merged;
};

export default DEFAULT_LABEL_PRINT_CONFIG;

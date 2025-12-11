// TEMPORARY: Add at the top of ProductGrid.jsx
const mockProducts = [
    {
        id: 1,
        name: 'Heritage Wool Suit',
        category: 'Suits',
        price: '1,850.00',
        description: 'Premium wool suit with heritage detailing',
        in_stock: true,
        discount_percent: 0,
        images: []
    },
    // Add 5-6 more mock products
];

// In your fetchProducts function, temporarily use mock data:
const fetchProducts = async () => {
    try {
        setLoading(true);
        // TEMPORARY: Use mock data
        setTimeout(() => {
            setProducts(mockProducts);
            setLoading(false);
        }, 500);

        // COMMENT OUT REAL API CALL FOR NOW:
        // const response = await API.getProducts({ per_page: 9 });
        // if (response.success) {
        //     setProducts(response.data);
        // }
    } catch (err) {
        console.error('Product fetch error:', err);
        setError('Unable to connect to server');
        setLoading(false);
    }
};

/* ─── Main Component ──────────────────────────────────────── */
export default function DrinkManager() {
    const queryClient = useQueryClient();
    const { activeOutlet, performanceMode, OUTLET_CONFIG } = useAdmin();

    // State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDrink, setEditingDrink] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        status: '',
        stockStatus: '',
    });

    // High Performance Matrix State
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [focusedId, setFocusedId] = useState(null);
    const [quickEditField, setQuickEditField] = useState(null);

    const [formData, setFormData] = useState({
        sku: '',
        name: '',
        price: '',
        stock_qty: '',
        category: '',
        status: 'available',
        is_service: false,
        image_path: '',
    });
    const [uploading, setUploading] = useState(false);
    const [toast, setToast] = useState(null);

    // API Query
    const { data, isLoading } = useQuery({
        queryKey: ['admin-drinks', page, filters, activeOutlet],
        queryFn: async () => {
            const params = {
                page,
                status: filters.status,
                category: filters.category,
                search: filters.search,
                stock_status: filters.stockStatus,
                outlet: activeOutlet,
            };
            const res = await axios.get('/api/v1/admin/pos/products', { params });
            return res.data;
        },
        keepPreviousData: true,
    });

    const drinks = data?.data || [];
    const meta = data?.meta || {};

    const categories = useMemo(() => {
        const cats = new Set(drinks.map((d) => d.category).filter(Boolean));
        return ['Espresso', 'Cold', 'Tea', 'Blend', ...Array.from(cats)]
            .filter((v, i, a) => a.indexOf(v) === i)
            .sort();
    }, [drinks]);

    const stats = useMemo(() => ({
        total: drinks.length,
        lowStock: drinks.filter(d => d.stock_qty <= 5 && d.stock_qty > 0 && !d.is_service).length,
        outOfStock: drinks.filter(d => d.stock_qty <= 0 && !d.is_service).length,
        unlimited: drinks.filter(d => d.is_service).length,
    }), [drinks]);

    const filteredDrinks = useMemo(() => {
        let result = drinks;
        if (filters.search) {
            const s = filters.search.toLowerCase();
            result = result.filter(d => 
                d.name.toLowerCase().includes(s) || 
                (d.sku && d.sku.toLowerCase().includes(s)) ||
                (d.category && d.category.toLowerCase().includes(s))
            );
        }
        if (filters.category) result = result.filter(d => d.category === filters.category);
        if (filters.stockStatus === 'low') result = result.filter(d => d.stock_qty <= 5 && d.stock_qty > 0 && !d.is_service);
        if (filters.stockStatus === 'out') result = result.filter(d => d.stock_qty <= 0 && !d.is_service);
        return result;
    }, [drinks, filters]);

    // Mutations
    const mutation = useMutation({
        mutationFn: async (payload) => {
            // Force outlet attachment to payload
            const data = { ...payload, outlet: activeOutlet };
            if (editingDrink) {
                return axios.put(`/api/v1/admin/pos/products/${editingDrink.id}`, data);
            }
            return axios.post('/api/v1/admin/pos/products', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-drinks']);
            setIsModalOpen(false);
            setIsSaving(false);
            setEditingDrink(null);
            setToast({ message: `Drink saved successfully!`, type: 'success' });
        },
        onError: (err) => {
            setIsSaving(false);
            setToast({ message: err.response?.data?.message || 'Failed to save drink.', type: 'error' });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => axios.delete(`/api/v1/admin/pos/products/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-drinks']);
            setToast({ message: 'Drink deleted successfully!', type: 'success' });
            setSelectedIds(new Set());
        },
    });

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids) => axios.post('/api/v1/admin/pos/products/bulk-delete', { ids }),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-drinks']);
            setToast({ message: 'Selected drinks deleted.', type: 'success' });
            setSelectedIds(new Set());
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => axios.put(`/api/v1/admin/pos/products/${id}`, { ...data, outlet: activeOutlet }),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-drinks']);
            setQuickEditField(null);
        }
    });

    // Handlers
    const toggleSelect = useCallback((id) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const handleSelectAll = () => {
        if (selectedIds.size === filteredDrinks.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredDrinks.map(d => d.id)));
        }
    };

    const handleBulkDelete = () => {
        if (!window.confirm(`Delete ${selectedIds.size} selected drinks?`)) return;
        bulkDeleteMutation.mutate(Array.from(selectedIds));
    };

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
                e.preventDefault();
                document.getElementById('search-drinks')?.focus();
            }

            if (filteredDrinks.length === 0) return;

            if (e.key === 'ArrowDown') {
                if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
                e.preventDefault();
                setFocusedId(prev => {
                    const idx = filteredDrinks.findIndex(d => d.id === prev);
                    if (idx === -1) return filteredDrinks[0]?.id;
                    return filteredDrinks[Math.min(idx + 1, filteredDrinks.length - 1)]?.id;
                });
            }
            if (e.key === 'ArrowUp') {
                if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
                e.preventDefault();
                setFocusedId(prev => {
                    const idx = filteredDrinks.findIndex(d => d.id === prev);
                    if (idx <= 0) return filteredDrinks[0]?.id;
                    return filteredDrinks[idx - 1]?.id;
                });
            }
            if (e.key === ' ') {
                if (document.activeElement.tagName !== 'INPUT') {
                    e.preventDefault();
                    if (focusedId) toggleSelect(focusedId);
                }
            }
            if (e.key.toLowerCase() === 'e') {
                if (focusedId && document.activeElement.tagName !== 'INPUT') {
                    e.preventDefault();
                    setQuickEditField('price');
                }
            }
            if (e.key.toLowerCase() === 's') {
                if (focusedId && document.activeElement.tagName !== 'INPUT') {
                    e.preventDefault();
                    setQuickEditField('stock');
                }
            }
            if (e.key === 'Enter') {
                if (focusedId && document.activeElement.tagName !== 'INPUT' && !quickEditField) {
                    e.preventDefault();
                    const drink = filteredDrinks.find(d => d.id === focusedId);
                    if (drink) {
                        setEditingDrink(drink);
                        setFormData({
                            sku: drink.sku || '',
                            name: drink.name || '',
                            price: drink.price || '',
                            stock_qty: drink.stock_qty || '',
                            category: drink.category || '',
                            status: drink.status || 'available',
                            is_service: drink.is_service || false,
                            image_path: drink.image_path || '',
                        });
                        setIsModalOpen(true);
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [filteredDrinks, focusedId, quickEditField, toggleSelect]);

    // UI Render Matrix
    return (
        <div className="flex h-screen bg-[#fdfdfc] dark:bg-[#010409] text-gray-900 dark:text-[#c9d1d9] font-sans overflow-hidden selection:bg-[#0d3542]/20 dark:selection:bg-[#58a6ff]/30">
            {toast && (
                <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-4 fade-in">
                    <div className={`px-6 py-4 rounded-2xl border flex items-center gap-3 font-black text-[13px] uppercase tracking-widest shadow-2xl ${toast.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400' : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400'}`}>
                        {toast.type === 'error' ? <AlertCircle size={18} /> : <Check size={18} />}
                        {toast.message}
                    </div>
                </div>
            )}

            {/* Sidebar */}
            <div className="w-[320px] shrink-0 border-r border-black/10 dark:border-white/5 bg-[#fdfdfc] dark:bg-[#010409] flex flex-col z-20">
                <div className="p-8 pb-6 border-b border-black/10 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-[#0d3542] dark:bg-[#58a6ff] rounded-xl flex items-center justify-center shadow-lg shadow-[#0d3542]/20 dark:shadow-[#58a6ff]/20">
                            <Coffee size={24} className="text-white dark:text-black" />
                        </div>
                        <div>
                            <h1 className="text-[24px] font-black tracking-tighter text-gray-900 dark:text-white leading-none">
                                Drinks
                            </h1>
                            <p className="text-[11px] font-bold tracking-widest text-[#0d3542] dark:text-[#58a6ff] uppercase mt-1">
                                {activeOutlet === 'attire_lounge' ? 'Lounge' : activeOutlet} Menu
                            </p>
                        </div>
                    </div>
                    <p className="text-[13px] text-gray-500 dark:text-[#8b949e] font-medium leading-relaxed">
                        Manage beverage inventory, prices, and categories.
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto attire-scrollbar p-6 space-y-6">
                    <SidebarSection title="Search & Filter">
                        <div className="relative group">
                            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#8b949e] group-focus-within:text-[#0d3542] dark:group-focus-within:text-[#58a6ff] transition-colors" />
                            <input
                                id="search-drinks"
                                type="text"
                                placeholder="Search drinks... (/)"
                                value={filters.search}
                                onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                                className="w-full bg-black/5 dark:bg-white/5 text-gray-900 dark:text-white text-[13px] font-bold rounded-xl pl-10 pr-4 py-3 outline-none border border-black/15 dark:border-white/10 focus:border-[#0d3542] dark:focus:border-[#58a6ff] transition-all placeholder-gray-400 dark:placeholder-white/20"
                            />
                        </div>
                    </SidebarSection>

                    <SidebarSection title="Categories">
                        <div className="space-y-1">
                            <button
                                onClick={() => setFilters(f => ({ ...f, category: '' }))}
                                className={`w-full text-left px-4 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-colors flex justify-between items-center ${!filters.category ? 'bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black' : 'text-gray-500 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-white/5'}`}
                            >
                                All Categories
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setFilters(f => ({ ...f, category: cat }))}
                                    className={`w-full text-left px-4 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-colors flex justify-between items-center ${filters.category === cat ? 'bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black' : 'text-gray-500 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-white/5'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </SidebarSection>
                    
                    <SidebarSection title="Inventory Health">
                        <div className="space-y-1">
                            <button
                                onClick={() => setFilters(f => ({ ...f, stockStatus: '' }))}
                                className={`w-full text-left px-4 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-colors flex justify-between items-center ${!filters.stockStatus ? 'bg-[#0d3542]/10 dark:bg-[#58a6ff]/10 text-[#0d3542] dark:text-[#58a6ff]' : 'text-gray-500 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-white/5'}`}
                            >
                                <span>All Items</span>
                                <span className="opacity-50">{stats.total}</span>
                            </button>
                            <button
                                onClick={() => setFilters(f => ({ ...f, stockStatus: 'low' }))}
                                className={`w-full text-left px-4 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-colors flex justify-between items-center ${filters.stockStatus === 'low' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'text-gray-500 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-white/5'}`}
                            >
                                <span>Low Stock</span>
                                <span className="opacity-50">{stats.lowStock}</span>
                            </button>
                            <button
                                onClick={() => setFilters(f => ({ ...f, stockStatus: 'out' }))}
                                className={`w-full text-left px-4 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-colors flex justify-between items-center ${filters.stockStatus === 'out' ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-white/5'}`}
                            >
                                <span>Out of Stock</span>
                                <span className="opacity-50">{stats.outOfStock}</span>
                            </button>
                        </div>
                    </SidebarSection>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col relative min-w-0">
                <header className="h-[80px] shrink-0 border-b border-black/10 dark:border-white/5 bg-[#fdfdfc]/80 dark:bg-[#010409]/80 backdrop-blur-xl px-8 flex items-center justify-between z-10">
                    <div className="flex items-center gap-6">
                        <div className="flex gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                            <span className="text-[10px] font-black tracking-widest uppercase text-emerald-600 dark:text-emerald-400">System Live</span>
                        </div>
                        <div className="h-4 w-px bg-black/10 dark:bg-white/10" />
                        <div className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase text-gray-400 dark:text-[#8b949e]">
                            <Keyboard size={12} />
                            <span>Cmd+K: Actions</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {selectedIds.size > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center gap-2 mr-4"
                            >
                                <span className="text-[11px] font-black uppercase tracking-widest text-[#0d3542] dark:text-[#58a6ff]">
                                    {selectedIds.size} Selected
                                </span>
                                <button
                                    onClick={handleBulkDelete}
                                    className="px-4 py-2.5 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white rounded-lg text-[11px] font-black uppercase tracking-widest transition-colors flex items-center gap-2"
                                >
                                    <Trash2 size={14} />
                                    Delete
                                </button>
                            </motion.div>
                        )}
                        <button
                            onClick={() => {
                                setEditingDrink(null);
                                setFormData({
                                    sku: '', name: '', price: '', stock_qty: '', category: '', status: 'available', is_service: false, image_path: ''
                                });
                                setIsModalOpen(true);
                            }}
                            className="h-[40px] px-6 bg-[#0d3542] dark:bg-[#58a6ff] hover:opacity-90 text-white dark:text-black rounded-xl text-[12px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-[#0d3542]/20 dark:shadow-[#58a6ff]/20"
                        >
                            <Plus size={16} />
                            New Drink
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-auto attire-scrollbar bg-[#f5f5f4] dark:bg-[#0d1117]">
                    {isLoading ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="flex flex-col items-center gap-4">
                                <LumaSpin size={32} />
                                <span className="text-[11px] font-black uppercase tracking-widest text-[#0d3542] dark:text-[#58a6ff] animate-pulse">Loading Matrix...</span>
                            </div>
                        </div>
                    ) : filteredDrinks.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center">
                                <Coffee size={48} className="mx-auto mb-4 text-black/10 dark:text-white/10" />
                                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1">No Drinks Found</h3>
                                <p className="text-sm text-gray-500 dark:text-[#8b949e]">Try adjusting your search or filters.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="min-w-[1000px] p-6 pb-24">
                            <div className="bg-[#fdfdfc] dark:bg-[#010409] border-2 border-black/10 dark:border-[#30363d] rounded-2xl shadow-xl overflow-hidden">
                                <table className="w-full text-left border-collapse table-fixed">
                                    <thead>
                                        <tr className="bg-black/5 dark:bg-white/5 border-b-2 border-black/10 dark:border-[#30363d]">
                                            <th className="w-16 px-4 py-4 text-center">
                                                <button onClick={handleSelectAll} className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all mx-auto ${selectedIds.size === filteredDrinks.length && filteredDrinks.length > 0 ? 'bg-[#0d3542] dark:bg-[#58a6ff] border-[#0d3542] dark:border-[#58a6ff]' : 'border-black/25 dark:border-[#30363d] hover:border-[#0d3542]/40'}`}>
                                                    {selectedIds.size === filteredDrinks.length && filteredDrinks.length > 0 && <Check size={12} className="text-white dark:text-black" />}
                                                </button>
                                            </th>
                                            <th className="w-16 px-4 py-4 text-center border-l-2 border-black/10 dark:border-[#30363d] text-[10px] font-black uppercase tracking-widest text-[#0d3542] dark:text-[#58a6ff]">STS</th>
                                            <th className="w-32 px-5 py-4 border-l-2 border-black/10 dark:border-[#30363d] text-[10px] font-black uppercase tracking-widest text-[#0d3542] dark:text-[#58a6ff] text-center">SKU</th>
                                            <th className="w-auto px-6 py-4 border-l-2 border-black/10 dark:border-[#30363d] text-[10px] font-black uppercase tracking-widest text-[#0d3542] dark:text-[#58a6ff]">Beverage</th>
                                            <th className="w-40 px-5 py-4 border-l-2 border-black/10 dark:border-[#30363d] text-[10px] font-black uppercase tracking-widest text-[#0d3542] dark:text-[#58a6ff] text-center">Category</th>
                                            <th className="w-32 px-6 py-4 border-l-2 border-black/10 dark:border-[#30363d] text-[10px] font-black uppercase tracking-widest text-[#0d3542] dark:text-[#58a6ff] text-right">Stock</th>
                                            <th className="w-32 px-8 py-4 border-l-2 border-black/10 dark:border-[#30363d] text-[10px] font-black uppercase tracking-widest text-[#0d3542] dark:text-[#58a6ff] text-center">Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredDrinks.map((d) => (
                                            <DrinkRow
                                                key={d.id}
                                                drink={d}
                                                isSelected={selectedIds.has(d.id)}
                                                isFocused={focusedId === d.id}
                                                quickEditField={quickEditField}
                                                onToggleSelect={toggleSelect}
                                                onFocus={setFocusedId}
                                                onEdit={(drink) => {
                                                    setEditingDrink(drink);
                                                    setFormData({
                                                        sku: drink.sku || '',
                                                        name: drink.name || '',
                                                        price: drink.price || '',
                                                        stock_qty: drink.stock_qty || '',
                                                        category: drink.category || '',
                                                        status: drink.status || 'available',
                                                        is_service: drink.is_service || false,
                                                        image_path: drink.image_path || '',
                                                    });
                                                    setIsModalOpen(true);
                                                }}
                                                onDelete={(id) => deleteMutation.mutate(id)}
                                                onQuickEdit={setQuickEditField}
                                                onUpdateField={(id, data) => updateMutation.mutate({ id, data })}
                                                performanceMode={performanceMode}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Editing Form Modal */}
            <ModernModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingDrink ? 'Edit Drink' : 'New Drink'} icon={Coffee}>
                <div className="p-6">
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        setIsSaving(true);
                        mutation.mutate(formData);
                    }} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5 col-span-2">
                                <label className="block text-[10px] font-semibold text-gray-400 dark:text-[#8b949e] uppercase tracking-wider ml-0.5">Name</label>
                                <input required value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} className="w-full bg-gray-50 dark:bg-[#0d1117] text-gray-900 dark:text-white px-4 py-2.5 rounded-lg border border-gray-200 dark:border-[#30363d] focus:border-[#0d3542] dark:focus:border-[#58a6ff] outline-none text-sm transition-colors" placeholder="Latte, Mocha..." />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-semibold text-gray-400 dark:text-[#8b949e] uppercase tracking-wider ml-0.5">Category</label>
                                <input value={formData.category} onChange={e => setFormData(f => ({ ...f, category: e.target.value }))} className="w-full bg-gray-50 dark:bg-[#0d1117] text-gray-900 dark:text-white px-4 py-2.5 rounded-lg border border-gray-200 dark:border-[#30363d] focus:border-[#0d3542] dark:focus:border-[#58a6ff] outline-none text-sm transition-colors" placeholder="Espresso, Tea..." />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-semibold text-gray-400 dark:text-[#8b949e] uppercase tracking-wider ml-0.5">Price</label>
                                <input type="number" step="0.01" required value={formData.price} onChange={e => setFormData(f => ({ ...f, price: e.target.value }))} className="w-full bg-gray-50 dark:bg-[#0d1117] text-gray-900 dark:text-white px-4 py-2.5 rounded-lg border border-gray-200 dark:border-[#30363d] focus:border-[#0d3542] dark:focus:border-[#58a6ff] outline-none text-sm transition-colors" placeholder="0.00" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-semibold text-gray-400 dark:text-[#8b949e] uppercase tracking-wider ml-0.5">Stock</label>
                                <input type="number" disabled={formData.is_service} value={formData.stock_qty} onChange={e => setFormData(f => ({ ...f, stock_qty: e.target.value }))} className="w-full bg-gray-50 dark:bg-[#0d1117] text-gray-900 dark:text-white px-4 py-2.5 rounded-lg border border-gray-200 dark:border-[#30363d] focus:border-[#0d3542] dark:focus:border-[#58a6ff] outline-none text-sm transition-colors disabled:opacity-50" placeholder={formData.is_service ? '∞' : '0'} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-semibold text-gray-400 dark:text-[#8b949e] uppercase tracking-wider ml-0.5">SKU (Optional)</label>
                                <input value={formData.sku} onChange={e => setFormData(f => ({ ...f, sku: e.target.value }))} className="w-full bg-gray-50 dark:bg-[#0d1117] text-gray-900 dark:text-white px-4 py-2.5 rounded-lg border border-gray-200 dark:border-[#30363d] focus:border-[#0d3542] dark:focus:border-[#58a6ff] outline-none text-sm transition-colors" placeholder="Auto-gen if empty" />
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-[#30363d] rounded-lg">
                            <label className="flex items-center gap-4 cursor-pointer">
                                <input type="checkbox" checked={formData.is_service} onChange={e => setFormData(f => ({ ...f, is_service: e.target.checked, stock_qty: e.target.checked ? '' : f.stock_qty }))} className="w-4 h-4 text-[#0d3542] dark:text-[#58a6ff] bg-white border-gray-300 rounded focus:ring-[#0d3542] dark:focus:ring-[#58a6ff]" />
                                <div>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Service Item / Unlimited</span>
                                    <p className="text-[10px] text-gray-500">Does not track stock</p>
                                </div>
                            </label>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-black/10 dark:border-white/10">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-lg text-[12px] font-black uppercase tracking-widest border-2 border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">Cancel</button>
                            <button type="submit" disabled={isSaving} className="flex-[2] py-2.5 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black rounded-lg text-[12px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
                                {isSaving ? <LumaSpin size={16} /> : <Save size={16} />}
                                {editingDrink ? 'Save Changes' : 'Create Drink'}
                            </button>
                        </div>
                    </form>
                </div>
            </ModernModal>
        </div>
    );
}

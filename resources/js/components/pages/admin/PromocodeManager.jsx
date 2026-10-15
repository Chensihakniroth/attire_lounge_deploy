import { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Copy, Plus, Tag, Ticket, Pencil, Trash2, ArrowUpDown, AlertTriangle, RefreshCw, Clock, CheckCircle2, Archive, CalendarDays } from 'lucide-react';
import DatePicker from '@/components/ui/DatePicker';
import ModernModal from '../../common/ModernModal';

const API = '/api';
const BRAND = '#f59e0b';

const swalTheme = (overrides = {}) => ({
  background: '#14161b',
  color: '#e7e9ee',
  confirmButtonColor: BRAND,
  cancelButtonColor: '#3a3f4b',
  ...overrides,
});

const buildPromoCode = () =>
  'PROMO-' + Math.random().toString(36).slice(2, 8).toUpperCase();

const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatDiscount = (pct) => `${pct}% off`;

export default function PromocodeManager() {
  const [promocodes, setPromocodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', discount_percentage: '', expires_at: '' });
  const [preview, setPreview] = useState(buildPromoCode());
  const [customMode, setCustomMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${API}/promocodes`);
      setPromocodes(Array.isArray(data) ? data : (data.promocodes || []));
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const changeFilter = (next) => setFilter(next);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', discount_percentage: '', expires_at: '', code: '' });
    setPreview(buildPromoCode());
    setCustomMode(false);
    setModalOpen(true);
  };

  const openEdit = (pc) => {
    setEditing(pc);
    setCustomMode(false);
    setForm({
      name: pc.name,
      discount_percentage: String(pc.discount_percentage),
      expires_at: pc.expires_at,
    });
    setPreview(pc.code);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Copied to clipboard', showConfirmButton: false, timer: 1200, ...swalTheme() });
    } catch (_) { /* clipboard unavailable */ }
  };

  const handleSave = async () => {
    const name = form.name.trim();
    const discount = parseInt(form.discount_percentage, 10);
    if (!name || isNaN(discount) || discount < 1 || discount > 100) {
      Swal.fire({ icon: 'error', title: 'Check your inputs', text: 'Name is required and discount must be 1–100.', ...swalTheme() });
      return;
    }
    if (!form.expires_at) {
      Swal.fire({ icon: 'error', title: 'Expiry required', text: 'Please pick an expiry date.', ...swalTheme() });
      return;
    }
    setSaving(true);
    const finalCode = editing
      ? preview
      : (customMode && form.code.trim() ? form.code.trim().toUpperCase() : preview);
    try {
      if (editing) {
        await axios.put(`${API}/promocodes/${editing.id}`, {
          name, discount_percentage: discount, expires_at: form.expires_at,
        });
        Swal.fire({ icon: 'success', title: 'Updated', text: `${name} saved.`, timer: 1500, showConfirmButton: false, ...swalTheme() });
      } else {
        await axios.post(`${API}/promocodes`, {
          name, discount_percentage: discount, code: finalCode, expires_at: form.expires_at,
        });
        Swal.fire({ icon: 'success', title: 'Created', text: `${finalCode} is live.`, timer: 1500, showConfirmButton: false, ...swalTheme() });
      }
      setModalOpen(false);
      load();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Save failed', text: err.response?.data?.message || err.message, ...swalTheme() });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (pc) => {
    const res = await Swal.fire({
      icon: 'warning', title: 'Delete this code?',
      text: `“${pc.code}” will be permanently removed.`,
      showCancelButton: true, confirmButtonText: 'Delete', cancelButtonText: 'Cancel',
      ...swalTheme(),
    });
    if (!res.isConfirmed) return;
    try {
      await axios.delete(`${API}/promocodes/${pc.id}`);
      setPromocodes((prev) => prev.filter((x) => x.id !== pc.id));
      Swal.fire({ icon: 'success', title: 'Deleted', text: `${pc.code} removed.`, timer: 1500, showConfirmButton: false, ...swalTheme() });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Delete failed', text: err.response?.data?.message || err.message, ...swalTheme() });
    }
  };

  const now = Date.now();
  const isArchived = (pc) => new Date(pc.expires_at).getTime() < now;

  const visible = promocodes
    .filter((pc) => {
      if (filter === 'live') return !isArchived(pc);
      if (filter === 'archived') return isArchived(pc);
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'oldest') return new Date(a.expires_at) - new Date(b.expires_at);
      if (sortBy === 'discount') return b.discount_percentage - a.discount_percentage;
      return new Date(b.expires_at) - new Date(a.expires_at);
    });

  const filters = [['all', 'All'], ['live', 'Live'], ['archived', 'Archived']];

  const stats = useMemo(() => {
    const live = promocodes.filter((pc) => !isArchived(pc));
    const archived = promocodes.length - live.length;
    const nextWeek = now + (7 * 24 * 60 * 60 * 1000);
    const expiringSoon = live.filter((pc) => new Date(pc.expires_at).getTime() <= nextWeek).length;
    return {
      total: promocodes.length,
      live: live.length,
      archived,
      expiringSoon,
    };
  }, [promocodes, now]);

  return (
    <div className="min-h-full bg-[#0b0c10] text-[#e7e9ee] px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f59e0b]/10 text-[#f59e0b] ring-1 ring-[#f59e0b]/20">
              <Ticket size={22} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#9aa0ab]">Store promotions</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#f4f5f7]">Promo codes</h1>
              <p className="mt-1 max-w-xl text-sm text-[#9aa0ab]">Create, share, and retire discounts without losing track of what is live.</p>
            </div>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#f59e0b] px-4 text-sm font-semibold text-black transition-all hover:bg-[#fbbf24] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/50"
          >
            <Plus size={16} /> New promo code
          </button>
        </header>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-[#14161b] p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#9aa0ab]">Total codes</p>
            <p className="mt-2 text-2xl font-mono tabular-nums text-[#f4f5f7]">{stats.total}</p>
          </div>
          <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.04] p-4">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-300/70"><CheckCircle2 size={12} /> Live now</p>
            <p className="mt-2 text-2xl font-mono tabular-nums text-emerald-300">{stats.live}</p>
          </div>
          <div className="rounded-2xl border border-amber-400/15 bg-amber-400/[0.04] p-4">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-300/70"><Clock size={12} /> Expiring soon</p>
            <p className="mt-2 text-2xl font-mono tabular-nums text-amber-300">{stats.expiringSoon}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#14161b] p-4">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#9aa0ab]"><Archive size={12} /> Archived</p>
            <p className="mt-2 text-2xl font-mono tabular-nums text-[#c4c8d0]">{stats.archived}</p>
          </div>
        </div>

        <section className="rounded-2xl border border-white/10 bg-[#14161b] p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {filters.map(([k, label]) => {
                const count = k === 'all' ? stats.total : k === 'live' ? stats.live : stats.archived;
                return (
                  <button
                    key={k}
                    onClick={() => changeFilter(k)}
                    className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/40 ${filter === k ? 'bg-[#f59e0b] text-black' : 'text-[#9aa0ab] hover:bg-white/5 hover:text-white'}`}
                  >
                    {label}
                    <span className="font-mono tabular-nums opacity-70">{count}</span>
                  </button>
                );
              })}
            </div>
            <label className="flex items-center gap-2 text-sm text-[#9aa0ab]">
              <ArrowUpDown size={14} />
              <span className="sr-only">Sort promo codes</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-white/10 bg-[#0f1115] px-3 py-2 text-sm text-[#e7e9ee] focus:outline-none focus:border-[#f59e0b]/50"
              >
                <option value="newest">Expiry: newest</option>
                <option value="oldest">Expiry: oldest</option>
                <option value="discount">Discount: highest</option>
              </select>
            </label>
          </div>
        </section>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-[#9aa0ab]">
            <RefreshCw size={16} className="animate-spin mr-2" /> Loading promo codes…
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertTriangle size={28} className="text-red-400 mb-3" />
            <p className="text-[#e7e9ee] mb-1">Couldn’t load promo codes</p>
            <p className="text-sm text-[#9aa0ab] mb-4">{error}</p>
            <button onClick={load} className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-white/10 hover:bg-white/5 transition-colors">
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-[#9aa0ab]">
            <Tag size={28} className="mb-3 opacity-50" />
            <p className="text-[#e7e9ee] mb-1">No promo codes {filter !== 'all' ? 'in this view' : 'yet'}</p>
            <p className="text-sm mb-4">{filter === 'all' ? 'Create your first discount code to get started.' : 'Try a different filter.'}</p>
            {filter === 'all' && (
              <button onClick={openCreate} className="inline-flex items-center gap-2 bg-[#f59e0b] hover:bg-[#fbbf24] text-black text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                <Plus size={16} /> New Promo Code
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((pc) => {
              const archived = isArchived(pc);
              return (
                <article key={pc.id} className={`group flex flex-col gap-5 rounded-2xl border border-white/10 bg-[#14161b] p-5 transition-all hover:border-white/20 ${archived ? 'opacity-70' : ''}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold text-[#f4f5f7]">{pc.name}</h3>
                      <p className="mt-1 text-sm text-[#9aa0ab]">{formatDiscount(pc.discount_percentage)}</p>
                    </div>
                    <StatusBadge archived={archived} pc={pc} />
                  </div>

                  <div className="rounded-xl border border-white/10 bg-[#0f1115] p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#9aa0ab]"><Tag size={13} /> Code</span>
                      <button onClick={() => copyCode(pc.code)} className="rounded-md p-1.5 text-[#9aa0ab] transition-colors hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/40" title="Copy promo code" aria-label={`Copy ${pc.code}`}>
                        <Copy size={14} />
                      </button>
                    </div>
                    <code className="mt-3 block truncate text-lg font-mono font-semibold tracking-[0.16em] text-[#f59e0b]">{pc.code}</code>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white/[0.03] p-3">
                      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#9aa0ab]"><CalendarDays size={12} /> Expires</span>
                      <strong className="mt-2 block text-sm font-medium text-[#e7e9ee]">{formatDate(pc.expires_at)}</strong>
                    </div>
                    <div className="rounded-xl bg-white/[0.03] p-3">
                      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#9aa0ab]"><Tag size={12} /> Discount</span>
                      <strong className="mt-2 block text-sm font-medium text-[#e7e9ee]">{formatDiscount(pc.discount_percentage)}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/10 pt-4">
                    <span className="text-xs text-[#9aa0ab]">{pc.max_usage ? `${pc.times_used ?? 0}/${pc.max_usage} used` : `${pc.times_used ?? 0} uses`}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(pc)} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-[#9aa0ab] transition-colors hover:bg-[#f59e0b]/10 hover:text-[#f59e0b] focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/40" title="Edit promo code">
                        <Pencil size={14} /> Edit
                      </button>
                      <button onClick={() => handleDelete(pc)} className="rounded-lg p-2 text-[#9aa0ab] transition-colors hover:bg-red-500/10 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500/40" title="Delete promo code" aria-label={`Delete ${pc.code}`}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <ModernModal isOpen={modalOpen} onClose={closeModal}
        title={<span className="flex items-center gap-2"><Ticket size={18} className="text-[#f59e0b]" /> {editing ? 'Edit Promo Code' : 'New Promo Code'}</span>}
        maxWidth="max-w-md">
        <div className="space-y-6 px-2 py-1">
          {editing ? (
            <div className="rounded-xl border border-white/10 bg-[#0f1115] p-5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#9aa0ab]"><Tag size={13} /> Promo Code</span>
                <button onClick={() => copyCode(preview)} className="text-[#9aa0ab] hover:text-white transition-colors" title="Copy code"><Copy size={16} /></button>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <code className="text-xl font-mono font-semibold tracking-[0.2em] text-[#f59e0b]">{preview}</code>
              </div>
              <p className="mt-2 text-xs text-[#9aa0ab]">Code is locked to keep existing redemptions valid.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-[#f59e0b]/20 bg-[#f59e0b]/[0.06] p-5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#f59e0b]/80"><Tag size={13} /> Promo Code</span>
                <div className="flex items-center rounded-lg border border-white/10 bg-[#0f1115] p-0.5 text-xs">
                  <button type="button" onClick={() => setCustomMode(false)}
                    className={!customMode ? "px-2.5 py-1 rounded-md bg-[#f59e0b] text-black font-medium" : "px-2.5 py-1 rounded-md text-[#9aa0ab] hover:text-white transition-colors"}>Auto</button>
                  <button type="button" onClick={() => { if (!form.code) setForm((f) => ({ ...f, code: preview })); setCustomMode(true); }}
                    className={customMode ? "px-2.5 py-1 rounded-md bg-[#f59e0b] text-black font-medium" : "px-2.5 py-1 rounded-md text-[#9aa0ab] hover:text-white transition-colors"}>Custom</button>
                </div>
              </div>

              {!customMode ? (
                <div className="mt-3 flex items-center justify-between gap-3">
                  <code className="text-xl font-mono font-semibold tracking-[0.2em] text-[#f59e0b]">{preview}</code>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setPreview(buildPromoCode())}
                      className="inline-flex items-center gap-1 text-xs text-[#9aa0ab] hover:text-white transition-colors"><RefreshCw size={12} /> Regenerate</button>
                    <button type="button" onClick={() => copyCode(preview)} className="text-[#9aa0ab] hover:text-white transition-colors" title="Copy code"><Copy size={16} /></button>
                  </div>
                </div>
              ) : (
                <div className="mt-3">
                  <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} maxLength={24}
                    placeholder="YOUR-CODE"
                    className="w-full bg-[#0f1115] border border-white/10 rounded-lg px-3 py-2 text-sm font-mono tracking-widest text-[#f59e0b] focus:outline-none focus:border-[#f59e0b]/60" />
                  <p className="mt-1.5 text-[11px] text-[#9aa0ab]">Letters, numbers and - only . auto-capitalized</p>
                </div>
              )}

              {form.discount_percentage ? (
                <p className="mt-2 text-xs text-[#9aa0ab]">{form.discount_percentage}% off{form.expires_at ? " - expires " + formatDate(form.expires_at) : ""}</p>
              ) : null}
            </div>
          )}

          <div>
            <label className="block text-sm text-[#9aa0ab] mb-1.5">Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Summer Sale"
              className="w-full bg-[#0f1115] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f59e0b]/50" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#9aa0ab] mb-1.5">Discount</label>
              <div className="relative">
                <input type="number" min="1" max="100" value={form.discount_percentage}
                  onChange={(e) => setForm({ ...form, discount_percentage: e.target.value })} placeholder="10"
                  className="w-full bg-[#0f1115] border border-white/10 rounded-lg pl-3 pr-8 py-2 text-sm focus:outline-none focus:border-[#f59e0b]/50" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9aa0ab] text-sm pointer-events-none">%</span>
              </div>
            </div>
            <div>
              <label className="block text-sm text-[#9aa0ab] mb-1.5">Expiry</label>
              <DatePicker value={form.expires_at} onChange={(v) => setForm({ ...form, expires_at: v })} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button onClick={closeModal}
              className="px-4 py-2 text-sm rounded-lg border border-white/10 text-[#9aa0ab] hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="px-4 py-2 text-sm rounded-lg bg-[#f59e0b] hover:bg-[#fbbf24] text-black font-medium transition-colors disabled:opacity-50">
              {saving ? 'Saving…' : (editing ? 'Save Changes' : 'Create Code')}
            </button>
          </div>
        </div>
      </ModernModal>
    </div>
  );
}

function StatusBadge({ archived, pc }) {
  if (archived) {
    return <span className="inline-flex items-center gap-1.5 text-xs text-[#9aa0ab]"><span className="w-1.5 h-1.5 rounded-full bg-[#6b7280]" /> Archived</span>;
  }
  const used = pc.times_used ?? 0;
  const max = pc.max_usage ?? Infinity;
  if (used >= max) {
    return <span className="inline-flex items-center gap-1.5 text-xs text-[#9aa0ab]"><span className="w-1.5 h-1.5 rounded-full bg-[#6b7280]" /> Exhausted</span>;
  }
  return <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Live</span>;
}

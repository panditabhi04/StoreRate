import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addStore, fetchStores, clearAdminStatus } from '../../redux/adminSlice';
import { fetchDashboardStats } from '../../redux/dashboardSlice';
import { API_BASE_URL } from '../../config/api';
import { X, Store, Mail, MapPin, User, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AddStoreModal({ isOpen, onClose, onStoreAdded }) {
  const dispatch = useDispatch();
  const { isSubmitting, error, successMessage } = useSelector((state) => state.admin);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    owner_id: 18,
  });

  const [owners, setOwners] = useState([]);

  // Fetch available Store Owners from /api/new-user when modal opens
  useEffect(() => {
    if (isOpen) {
      const token =
        localStorage.getItem('token') ||
        localStorage.getItem('storerate_token');

      fetch(`${API_BASE_URL}/new-user`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
        .then((res) => res.json())
        .then((data) => {
          const list = data.data || (Array.isArray(data) ? data : []);
          const ownerUsers = list.filter(
            (u) => (u.role || '').toUpperCase() === 'OWNER'
          );
          if (ownerUsers.length > 0) {
            setOwners(ownerUsers);
            // Default to first owner if not set
            setFormData((prev) => ({
              ...prev,
              owner_id: prev.owner_id || ownerUsers[0].id,
            }));
          }
        })
        .catch(() => { });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error || successMessage) dispatch(clearAdminStatus());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
      owner_id: Number(formData.owner_id),
    };

    const res = await dispatch(addStore(payload));
    if (res.meta.requestStatus === 'fulfilled') {
      dispatch(fetchDashboardStats());
      dispatch(fetchStores());
      if (onStoreAdded) onStoreAdded(payload);
      setTimeout(() => {
        dispatch(clearAdminStatus());
        setFormData({ name: '', email: '', address: '', owner_id: 18 });
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Add New Store</h3>
            <p className="text-xs text-slate-500">Register a commercial retail store</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Store Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Bigmart Super Market"
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Store Email <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                name="email"
                required
                placeholder="e.g. Bigmart@supermarket.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Store Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                name="address"
                required
                placeholder="e.g. Kothrud, Pune, Maharashtra"
                value={formData.address}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Store Owner (Owner ID) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              {owners.length > 0 ? (
                <select
                  name="owner_id"
                  required
                  value={formData.owner_id}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                >
                  {owners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name}
                    </option>
                  ))}
                  <option value={18}>Default Owner ID: #18</option>
                </select>
              ) : (
                <input
                  type="number"
                  name="owner_id"
                  required
                  placeholder="18"
                  value={formData.owner_id}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                />
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Assigned owner numeric ID (e.g. <code>18</code> for Abhishek Pandit Owner)
            </p>
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white shadow-md shadow-blue-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Adding Store...</span>
                </>
              ) : (
                <span>Add Store</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

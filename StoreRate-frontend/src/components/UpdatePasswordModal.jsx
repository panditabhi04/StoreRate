import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserPassword, clearPasswordStatus } from '../redux/authSlice';
import {
  X,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  Info
} from 'lucide-react';

export default function UpdatePasswordModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { authUser, isUpdatingPassword, passwordUpdateSuccess, passwordUpdateError } =
    useSelector((state) => ({
      authUser: state.auth?.user,
      isUpdatingPassword: state.auth?.isUpdatingPassword,
      passwordUpdateSuccess: state.auth?.passwordUpdateSuccess,
      passwordUpdateError: state.auth?.passwordUpdateError,
    }));

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [clientError, setClientError] = useState('');

  // Check role: Normal users (role: 'USER') and Store Owners can update their password
  const userRole = (authUser?.role || '').trim().toUpperCase();
  const isAdmin = userRole === 'ADMIN';
  const isAllowedToUpdate = !isAdmin;
  const isStoreOwner =
    userRole === 'STORE_OWNER' ||
    userRole === 'OWNER' ||
    userRole.includes('OWNER') ||
    !!authUser?.is_owner;

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setClientError('');
      dispatch(clearPasswordStatus());
    }
  }, [isOpen, dispatch]);

  if (!isOpen) return null;

  // Validation rules per StoreRate specification:
  // Password: 8 to 16 characters, at least one uppercase letter and one special character
  const isLengthValid = formData.newPassword.length >= 8 && formData.newPassword.length <= 16;
  const hasUpperCase = /[A-Z]/.test(formData.newPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_~`\-+=\[\]\\;/]/.test(formData.newPassword);
  const isMatchValid =
    formData.confirmPassword.length > 0 &&
    formData.newPassword === formData.confirmPassword;
  const isDifferentFromCurrent =
    !formData.currentPassword ||
    !formData.newPassword ||
    formData.currentPassword !== formData.newPassword;

  const isFormValid =
    isLengthValid &&
    hasUpperCase &&
    hasSpecialChar &&
    isMatchValid &&
    formData.currentPassword.trim().length > 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (clientError) setClientError('');
    if (passwordUpdateError || passwordUpdateSuccess) dispatch(clearPasswordStatus());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setClientError('');

    // Authorization check: Normal users and store owners are permitted
    if (!isAllowedToUpdate) {
      setClientError('Access restricted: Administrator accounts cannot update passwords through this modal.');
      return;
    }

    if (!formData.currentPassword) {
      setClientError('Please enter your current password.');
      return;
    }

    if (!isLengthValid) {
      setClientError('New password must be between 8 and 16 characters.');
      return;
    }

    if (!hasUpperCase) {
      setClientError('New password must contain at least one uppercase letter (A-Z).');
      return;
    }

    if (!hasSpecialChar) {
      setClientError('New password must contain at least one special character (!@#$%...).');
      return;
    }

    if (!isMatchValid) {
      setClientError('New password and confirm password do not match.');
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setClientError('New password cannot be the same as your current password.');
      return;
    }

    const res = await dispatch(
      updateUserPassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      })
    );

    if (res.meta.requestStatus === 'fulfilled') {
      setTimeout(() => {
        dispatch(clearPasswordStatus());
        onClose();
      }, 1800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-in zoom-in-95">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          title="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">Update Password</h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {isStoreOwner ? 'Store Owner' : userRole === 'USER' ? 'Normal User' : 'User'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Update your account password securely after login
            </p>
          </div>
        </div>

        {/* Warning if current logged in user is NOT allowed (e.g. Admin) */}
        {!isAllowedToUpdate ? (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-2 mb-4">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Restricted to Normal Users & Store Owners</span>
            </div>
            <p className="text-amber-700 leading-relaxed">
              Your account role is <strong>{userRole || 'ADMIN'}</strong>.
              Only normal platform users and store owners are permitted to update their password.
            </p>
            <button
              onClick={onClose}
              className="mt-2 w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Understood
            </button>
          </div>
        ) : (
          <>
            {/* Error Notifications */}
            {(clientError || passwordUpdateError) && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in slide-in-from-top-1">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-semibold block">Password Update Error</span>
                  <span>{clientError || passwordUpdateError}</span>
                </div>
              </div>
            )}

            {/* Success Notification */}
            {passwordUpdateSuccess && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-in slide-in-from-top-1">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Password Successfully Updated!</span>
                  <span>{passwordUpdateSuccess}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Current Password Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    name="currentPassword"
                    required
                    placeholder="Enter your current password"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-11 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    name="newPassword"
                    required
                    placeholder="8 to 16 chars with uppercase & symbol"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-11 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:bg-white focus:ring-2 transition-all text-slate-800 ${
                      formData.newPassword.length > 0 && (!isLengthValid || !hasUpperCase || !hasSpecialChar)
                        ? 'border-amber-300 focus:ring-amber-500/20 focus:border-amber-500'
                        : formData.newPassword.length > 0 && isLengthValid && hasUpperCase && hasSpecialChar
                        ? 'border-emerald-300 focus:ring-emerald-500/20 focus:border-emerald-500'
                        : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    required
                    placeholder="Re-enter your new password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-11 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:bg-white focus:ring-2 transition-all text-slate-800 ${
                      formData.confirmPassword.length > 0 && !isMatchValid
                        ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                        : formData.confirmPassword.length > 0 && isMatchValid
                        ? 'border-emerald-300 focus:ring-emerald-500/20 focus:border-emerald-500'
                        : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Requirement Checklist (Strict StoreRate Rules) */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-[11px] space-y-1.5 text-slate-600">
                <span className="font-semibold text-slate-700 block mb-1">
                  Password Requirements (StoreRate Normal User):
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <div
                    className={`flex items-center gap-1.5 ${
                      isLengthValid ? 'text-emerald-600 font-medium' : 'text-slate-400'
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                        isLengthValid ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      ✓
                    </div>
                    <span>8 to 16 characters</span>
                  </div>

                  <div
                    className={`flex items-center gap-1.5 ${
                      hasUpperCase ? 'text-emerald-600 font-medium' : 'text-slate-400'
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                        hasUpperCase ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      ✓
                    </div>
                    <span>1+ uppercase letter</span>
                  </div>

                  <div
                    className={`flex items-center gap-1.5 ${
                      hasSpecialChar ? 'text-emerald-600 font-medium' : 'text-slate-400'
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                        hasSpecialChar ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      ✓
                    </div>
                    <span>1+ special symbol</span>
                  </div>

                  <div
                    className={`flex items-center gap-1.5 ${
                      isMatchValid ? 'text-emerald-600 font-medium' : 'text-slate-400'
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                        isMatchValid ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      ✓
                    </div>
                    <span>Passwords match</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
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
                  disabled={isUpdatingPassword || !isFormValid || !!passwordUpdateSuccess}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdatingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

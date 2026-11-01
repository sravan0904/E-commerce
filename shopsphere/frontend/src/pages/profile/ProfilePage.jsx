import React, { useEffect, useState } from 'react';
import { User, MapPin, Lock, ShoppingBag, Loader2, Plus, Trash2, Check } from 'lucide-react';
import { userAPI } from '../../api/index';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const tabs = [
  { id: 'profile', label: 'Personal Info', icon: User },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'password', label: 'Change Password', icon: Lock },
];

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');

  // Profile
  const [profile, setProfile] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  // Addresses
  const [addresses, setAddresses] = useState([]);
  const [loadingAddr, setLoadingAddr] = useState(true);
  const [showAddAddr, setShowAddAddr] = useState(false);
  const [newAddr, setNewAddr] = useState({ fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', country: 'India', isDefault: false });

  // Password
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    if (user) setProfile({ firstName: user.firstName || '', lastName: user.lastName || '', email: user.email || '', phone: user.phone || '' });
  }, [user]);

  useEffect(() => {
    if (activeTab === 'addresses') {
      setLoadingAddr(true);
      userAPI.getAddresses().then((r) => setAddresses(r.data || [])).catch(() => {}).finally(() => setLoadingAddr(false));
    }
  }, [activeTab]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const r = await userAPI.updateProfile({ firstName: profile.firstName, lastName: profile.lastName, phone: profile.phone });
      updateUser && updateUser(r.data);
      showToast('Profile updated!', 'success');
    } catch { showToast('Failed to update profile', 'error'); }
    finally { setSavingProfile(false); }
  };

  const handleSaveAddress = async () => {
    if (!newAddr.fullName || !newAddr.addressLine1 || !newAddr.city || !newAddr.pincode) {
      showToast('Please fill required fields', 'error'); return;
    }
    try {
      const r = await userAPI.addAddress(newAddr);
      setAddresses((p) => [...p, r.data]);
      setShowAddAddr(false);
      setNewAddr({ fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', country: 'India', isDefault: false });
      showToast('Address saved!', 'success');
    } catch { showToast('Failed to save address', 'error'); }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await userAPI.deleteAddress(id);
      setAddresses((p) => p.filter((a) => a.id !== id));
      showToast('Address deleted', 'success');
    } catch { showToast('Failed to delete address', 'error'); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { showToast('Passwords do not match', 'error'); return; }
    if (pwForm.newPassword.length < 8) { showToast('Password must be at least 8 characters', 'error'); return; }
    setSavingPw(true);
    try {
      await userAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      showToast('Password changed!', 'success');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { showToast(err?.response?.data?.message || 'Failed to change password', 'error'); }
    finally { setSavingPw(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">My Account</h1>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-1">
              {/* Avatar */}
              <div className="text-center py-4 border-b border-gray-100 mb-3">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-emerald-700">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
                </div>
                <p className="mt-2 font-semibold text-gray-900 text-sm">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    activeTab === t.id ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <t.icon className="w-4 h-4" /> {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="md:col-span-3">
            {/* Personal Info */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-900 mb-6">Personal Information</h2>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                      <input type="text" value={profile.firstName} onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                      <input type="text" value={profile.lastName} onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                    <input type="email" value={profile.email} disabled
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-400" />
                    <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                    <input type="tel" value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                  </div>
                  <button type="submit" disabled={savingProfile}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm flex items-center gap-2 disabled:opacity-60 transition-colors">
                    {savingProfile ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Check className="w-4 h-4" /> Save Changes</>}
                  </button>
                </form>
              </div>
            )}

            {/* Addresses */}
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-semibold text-gray-900">Saved Addresses</h2>
                  <button onClick={() => setShowAddAddr((v) => !v)}
                    className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium hover:text-emerald-700">
                    <Plus className="w-4 h-4" /> Add Address
                  </button>
                </div>

                {showAddAddr && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-xl space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-xs font-medium text-gray-600 mb-1 block">Full Name *</label>
                        <input type="text" value={newAddr.fullName} onChange={(e) => setNewAddr((p) => ({ ...p, fullName: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                      <div><label className="text-xs font-medium text-gray-600 mb-1 block">Phone</label>
                        <input type="tel" value={newAddr.phone} onChange={(e) => setNewAddr((p) => ({ ...p, phone: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                    </div>
                    <div><label className="text-xs font-medium text-gray-600 mb-1 block">Address Line 1 *</label>
                      <input type="text" value={newAddr.addressLine1} onChange={(e) => setNewAddr((p) => ({ ...p, addressLine1: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                    <div><label className="text-xs font-medium text-gray-600 mb-1 block">Address Line 2</label>
                      <input type="text" value={newAddr.addressLine2} onChange={(e) => setNewAddr((p) => ({ ...p, addressLine2: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                    <div className="grid grid-cols-3 gap-3">
                      <div><label className="text-xs font-medium text-gray-600 mb-1 block">City *</label>
                        <input type="text" value={newAddr.city} onChange={(e) => setNewAddr((p) => ({ ...p, city: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                      <div><label className="text-xs font-medium text-gray-600 mb-1 block">State</label>
                        <input type="text" value={newAddr.state} onChange={(e) => setNewAddr((p) => ({ ...p, state: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                      <div><label className="text-xs font-medium text-gray-600 mb-1 block">Pincode *</label>
                        <input type="text" value={newAddr.pincode} onChange={(e) => setNewAddr((p) => ({ ...p, pincode: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input type="checkbox" checked={newAddr.isDefault} onChange={(e) => setNewAddr((p) => ({ ...p, isDefault: e.target.checked }))} className="accent-emerald-600" />
                      Set as default
                    </label>
                    <div className="flex gap-2">
                      <button onClick={handleSaveAddress} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">Save</button>
                      <button onClick={() => setShowAddAddr(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                    </div>
                  </div>
                )}

                {loadingAddr ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
                ) : addresses.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-8">No saved addresses yet.</p>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((addr) => (
                      <div key={addr.id} className={`p-4 border-2 rounded-xl ${addr.isDefault ? 'border-emerald-200 bg-emerald-50' : 'border-gray-100'}`}>
                        <div className="flex justify-between">
                          <div className="text-sm space-y-0.5">
                            <div className="font-semibold text-gray-900 flex items-center gap-2">
                              {addr.fullName}
                              {addr.isDefault && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Default</span>}
                            </div>
                            <div className="text-gray-600">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}</div>
                            <div className="text-gray-600">{addr.city}, {addr.state} - {addr.pincode}</div>
                            {addr.phone && <div className="text-gray-500">{addr.phone}</div>}
                          </div>
                          <button onClick={() => handleDeleteAddress(addr.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1 self-start">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Change Password */}
            {activeTab === 'password' && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-900 mb-6">Change Password</h2>
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  {[
                    { label: 'Current Password', key: 'currentPassword' },
                    { label: 'New Password', key: 'newPassword' },
                    { label: 'Confirm New Password', key: 'confirmPassword' },
                  ].map((f) => (
                    <div key={f.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
                      <input type="password" value={pwForm[f.key]} onChange={(e) => setPwForm((p) => ({ ...p, [f.key]: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                    </div>
                  ))}
                  <button type="submit" disabled={savingPw}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm flex items-center gap-2 disabled:opacity-60 transition-colors">
                    {savingPw ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : <><Lock className="w-4 h-4" /> Update Password</>}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

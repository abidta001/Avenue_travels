
import React, { useState } from 'react';
import { Key, Mail, Phone, UserCircle, Camera, Save, Image as ImageIcon } from 'lucide-react';
import { User as UserType } from '../types';

interface ProfileProps {
  user: UserType;
  onUpdate: (u: Partial<UserType>) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdate }) => {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isEditingPic, setIsEditingPic] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpdateInfo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updates = {
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
    };
    onUpdate(updates);
    setMessage('Profile updated successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleUpdatePic = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const profilePic = formData.get('profilePic') as string;
    onUpdate({ profilePic });
    setIsEditingPic(false);
    setMessage('Profile picture updated!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleUpdatePassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPass = formData.get('newPassword') as string;
    const confirmPass = formData.get('confirmPassword') as string;

    if (newPass !== confirmPass) {
      alert("Passwords don't match!");
      return;
    }

    onUpdate({ password: newPass });
    setMessage('Password changed successfully! You can use your new password next time you login.');
    setIsChangingPassword(false);
    setTimeout(() => setMessage(''), 5000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {message && (
        <div className="bg-emerald-100 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl animate-in fade-in slide-in-from-top-4 duration-300 shadow-sm">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="relative mb-4 group">
              <img src={user.profilePic} className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover" alt="Profile" />
              <button 
                onClick={() => setIsEditingPic(!isEditingPic)}
                className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all scale-100 active:scale-95"
              >
                <Camera size={16} />
              </button>
            </div>
            <h3 className="text-xl font-bold text-slate-800">{user.username}</h3>
            <p className="text-slate-500 text-sm mb-4 uppercase tracking-widest font-bold">Admin Member</p>
            
            {isEditingPic && (
              <form onSubmit={handleUpdatePic} className="w-full mb-4 animate-in zoom-in duration-200">
                 <label className="block text-xs font-bold text-slate-400 mb-1 text-left">Image URL</label>
                 <div className="flex space-x-2">
                    <input name="profilePic" defaultValue={user.profilePic} required className="flex-1 text-xs p-2 bg-slate-50 border border-slate-200 rounded outline-none focus:ring-1 focus:ring-blue-500" />
                    <button type="submit" className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"><Save size={14} /></button>
                 </div>
              </form>
            )}

            <div className="w-full pt-4 border-t border-slate-50 space-y-2">
              <div className="flex items-center text-sm text-slate-600">
                <Mail size={14} className="mr-2 text-slate-400" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <Phone size={14} className="mr-2 text-slate-400" />
                {user.phone}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center">
              <Key size={18} className="mr-2 text-blue-500" />
              Security Settings
            </h4>
            <button 
              onClick={() => setIsChangingPassword(!isChangingPassword)}
              className="w-full py-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center"
            >
              <Key size={14} className="mr-2" />
              Change Password
            </button>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
              <UserCircle size={22} className="mr-2 text-blue-500" />
              Administrative Information
            </h4>
            <form onSubmit={handleUpdateInfo} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 font-semibold">Account Username</label>
                  <input value={user.username} disabled className="w-full p-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-400 cursor-not-allowed font-bold" />
                  <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">Read-only system identifier</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 font-semibold">Contact Email</label>
                  <input name="email" type="email" defaultValue={user.email} required className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1 font-semibold">Phone Number</label>
                  <input name="phone" defaultValue={user.phone} required className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                </div>
              </div>
              <div className="pt-4">
                <button type="submit" className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-md transition-all active:scale-95">
                  <Save size={18} className="mr-2" />
                  Commit Changes to Local DB
                </button>
              </div>
            </form>

            {isChangingPassword && (
              <div className="mt-12 pt-8 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                  <Key size={22} className="mr-2 text-orange-500" />
                  Credentials Update
                </h4>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1 text-orange-600 font-bold">New Secure Password</label>
                      <input name="newPassword" type="password" required className="w-full p-2 bg-orange-50/20 border border-orange-100 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Enter new password" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1 text-orange-600 font-bold">Confirm New Password</label>
                      <input name="confirmPassword" type="password" required className="w-full p-2 bg-orange-50/20 border border-orange-100 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Verify new password" />
                    </div>
                  </div>
                  <div className="pt-4 flex space-x-3">
                    <button type="submit" className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-bold shadow-md transition-all active:scale-95">
                      Confirm New Credentials
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setIsChangingPassword(false)}
                      className="px-6 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 font-medium"
                    >
                      Dismiss
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

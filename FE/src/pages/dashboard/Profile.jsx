import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { User, Mail, Camera, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../utils/api';


const Profile = () => {
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        avatarUrl: ''
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/users/${userId}`);
                setFormData({
                    fullName: res.data.fullName || '',
                    email: res.data.email || '',
                    avatarUrl: res.data.avatarUrl || ''
                });
            } catch (err) {
                toast.error('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };
        if (userId) fetchUser();
    }, [userId]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formDataFile = new FormData();
        formDataFile.append('file', file);

        setIsUploading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/api/files/upload`, formDataFile, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, avatarUrl: res.data.url }));
            toast.success('Image uploaded!');
        } catch (err) {
            toast.error('Upload failed!');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put(`${API_BASE_URL}/api/users/${userId}`, {
                fullName: formData.fullName,
                avatarUrl: formData.avatarUrl
            });
            localStorage.setItem('fullName', res.data.fullName);
            localStorage.setItem('avatarUrl', res.data.avatarUrl || '');
            window.dispatchEvent(new CustomEvent('profileRefresh'));
            toast.success('Profile updated successfully!');
            // Refresh parent state or just redirect
        } catch (err) {
            toast.error('Update failed');
        }
    };

    if (loading) return <div className="p-20 text-center font-black animate-pulse text-orange-600 uppercase tracking-widest text-xl">Loading Profile...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-700">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => navigate(-1)}
                    className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400 hover:text-orange-600 hover:border-orange-100 transition-all active:scale-95"
                >
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">My Profile</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Avatar Upload */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm text-center space-y-6">
                        <div className="relative inline-block group">
                            <div className="w-40 h-40 rounded-[40px] overflow-hidden border-4 border-slate-50 shadow-inner bg-slate-50 flex items-center justify-center">
                                {formData.avatarUrl ? (
                                    <img 
                                        src={formData.avatarUrl} 
                                        alt="Profile" 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                    />
                                ) : (
                                    <div className="text-6xl font-black text-slate-200">{formData.fullName.charAt(0)}</div>
                                )}
                                {isUploading && (
                                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-[40px]">
                                        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>
                            <label className="absolute -bottom-2 -right-2 bg-slate-900 text-white p-3 rounded-2xl shadow-xl cursor-pointer hover:bg-orange-600 transition-all active:scale-90 border-4 border-white">
                                <Camera size={20} />
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                            </label>
                        </div>
                        <div>
                            <p className="text-xl font-black text-slate-900 tracking-tight">{formData.fullName}</p>
                            <p className="text-sm font-bold text-slate-400">{formData.email}</p>
                        </div>
                    </div>
                </div>

                {/* Right: Form */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
                        <div className="grid grid-cols-1 gap-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                                    <User size={12} className="text-orange-500" /> Full Name
                                </label>
                                <input 
                                    type="text" 
                                    value={formData.fullName} 
                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                    required
                                    placeholder="Enter your full name" 
                                    className="w-full bg-slate-50 border-none rounded-[24px] px-8 py-4 font-black text-slate-900 focus:ring-2 focus:ring-orange-500/20 text-lg transition-all" 
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                                    <Mail size={12} className="text-orange-500" /> Email Address
                                </label>
                                <input 
                                    type="email" 
                                    value={formData.email} 
                                    disabled
                                    className="w-full bg-slate-50 border-none rounded-[24px] px-8 py-4 font-black text-slate-900 focus:ring-2 focus:ring-orange-500/20 text-lg transition-all" 
                                />
                                <p className="text-[10px] font-bold text-slate-300 ml-4 italic px-2 py-1 bg-slate-50 rounded-lg inline-block">Contact support to change email</p>
                            </div>
                        </div>

                        <div className="pt-4 flex gap-4">
                            <button 
                                type="submit" 
                                className="flex-1 bg-slate-900 text-white font-black py-5 rounded-2xl shadow-2xl shadow-slate-900/40 hover:scale-[1.02] active:scale-95 transition-all text-lg flex items-center justify-center gap-4"
                            >
                                <Save size={24} />
                                Update Profile
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;

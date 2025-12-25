// src/pages/Profile/Partials/UpdateProfileInformation.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import api from '@/api/apiClient';
import { Input } from '@/Components/ui/input';

export default function UpdateProfileInformation({ user, className = '' }) {
    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
    });

    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [saved, setSaved] = useState(false);
    const [toast, setToast] = useState(null);

    // Sync form data when user prop changes
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
            });
        }
    }, [user]);

    const submit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});
        setSaved(false);
        setToast(null);

        try {
            await api.patch('/user/profile', {
                name: formData.name,
                email: formData.email,
            });

            setSaved(true);
            
            // Auto-hide success message after 3 seconds
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                // Show error as toast instead of alert
                const message = error.response?.data?.message || 'Failed to update profile. Please try again.';
                setToast({ message, type: 'error' });
            }
        } finally {
            setProcessing(false);
        }
    };

    const hideToast = () => {
        setToast(null);
    };

    return (
        <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white rounded-2xl shadow-sm p-6 ${className}`}
        >
            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md ${
                            toast.type === 'error' 
                                ? 'bg-red-50 border border-red-200 text-red-800' 
                                : 'bg-green-50 border border-green-200 text-green-800'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-current"></div>
                            <span className="text-sm font-medium">{toast.message}</span>
                            <button 
                                onClick={hideToast}
                                className="ml-auto text-current hover:opacity-75"
                                aria-label="Close notification"
                            >
                                &times;
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <header>
                <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                <p className="mt-1 text-sm text-gray-600">
                    Update your account's profile information and email address.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-5">
                <div>
                    <InputLabel htmlFor="name" value="Name" />
                    <Input
                        id="name"
                        className="mt-2 w-1/2 block border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        autoComplete="name"
                    />
                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" />
                    <Input
                        id="email"
                        type="email"
                        className="mt-2 w-1/2 block border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        autoComplete="username"
                    />
                    <InputError className="mt-2" message={errors.email} />
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton 
                        type="submit" 
                        disabled={processing} 
                        className="px-5 py-2 rounded-lg"
                    >
                        {processing ? 'Saving...' : 'Save'}
                    </PrimaryButton>

                    <AnimatePresence>
                        {saved && (
                            <motion.p
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="text-sm font-medium text-green-600"
                            >
                                Saved!
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>
            </form>
        </motion.section>
    );
}
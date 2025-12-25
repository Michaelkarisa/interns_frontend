// src/pages/Profile/Partials/DeleteUserForm.jsx
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/api/apiClient';
import DangerButton from '@/Layouts1/DangerButton';
import SecondaryButton from '@/Layouts1/SecondaryButton';
import InputLabel from '@/Layouts1/InputLabel';
import InputError from '@/Layouts1/InputError';
import { Input } from '@/Layouts1/ui/input';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from "react-router-dom";

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [countdown, setCountdown] = useState(15);
    const [autoDeleteActive, setAutoDeleteActive] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // 👈 Password visibility state
    const passwordInput = useRef();
    const countdownRef = useRef(null);
    const navigate = useNavigate();

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
        setPassword('');
        setErrors({});
        setShowPassword(false); // Reset visibility when opening modal
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        setPassword('');
        setErrors({});
        setAutoDeleteActive(false);
        setCountdown(15);
        setShowPassword(false);
        if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
        }
    };

    // Verify password and start countdown
    const verifyPassword = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            await api.post('/profile/verify-password', { password });
            setAutoDeleteActive(true);
            setCountdown(15);
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                setErrors({ password: 'The provided password is incorrect.' });
            }
            setProcessing(false);
            passwordInput.current?.focus();
        }
    };

    // Perform actual deletion
    const performDeletion = async () => {
        setProcessing(true);
        setErrors({});

        try {
            await api.delete('/profile');
            navigate('/login');
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                setErrors({ password: 'Unable to delete account. Please try again.' });
            }
            setProcessing(false);
            setAutoDeleteActive(false);
            passwordInput.current?.focus();
        }
    };

    // Handle force delete (bypass countdown)
    const forceDelete = (e) => {
        e.preventDefault();
        if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
        }
        performDeletion();
    };

    // Auto-delete countdown effect
    useEffect(() => {
        if (autoDeleteActive && countdown > 0) {
            countdownRef.current = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        if (countdownRef.current) {
                            clearInterval(countdownRef.current);
                            countdownRef.current = null;
                        }
                        performDeletion();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (countdownRef.current) {
                clearInterval(countdownRef.current);
                countdownRef.current = null;
            }
        };
    }, [autoDeleteActive, countdown]);

    const cancelAutoDelete = () => {
        setAutoDeleteActive(false);
        if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
        }
    };

    // Toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`bg-white rounded-2xl shadow-sm p-6 ${className}`}
        >
            <header>
                <h2 className="text-lg font-semibold text-gray-900">Delete Account</h2>
                <p className="mt-1 text-sm text-gray-600">
                    Once your account is deleted, all of its resources and data will be permanently deleted.
                </p>
            </header>

            <div className="mt-4">
                <DangerButton
                    onClick={confirmUserDeletion}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-lg transition-colors duration-200"
                >
                    Delete Account
                </DangerButton>
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {confirmingUserDeletion && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
                        onClick={closeModal}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6"
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        {autoDeleteActive 
                                            ? `Deleting in ${countdown} seconds...` 
                                            : 'Delete Account?'
                                        }
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-600">
                                        {autoDeleteActive 
                                            ? 'Your account will be permanently deleted automatically.'
                                            : 'Please enter your password to confirm deletion.'
                                        }
                                    </p>
                                </div>
                            </div>

                            {autoDeleteActive ? (
                                // Auto-delete mode (after password verified)
                                <div className="mt-5 space-y-4">
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <p className="text-sm text-red-800 font-medium">
                                            ⚠️ This action cannot be undone!
                                        </p>
                                        <p className="text-sm text-red-700 mt-1">
                                            You have <span className="font-bold">{countdown}</span> seconds to cancel.
                                        </p>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <SecondaryButton
                                            onClick={cancelAutoDelete}
                                            className="flex-1 px-4 py-2 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-lg"
                                        >
                                            Cancel Deletion
                                        </SecondaryButton>
                                        <DangerButton
                                            onClick={forceDelete}
                                            disabled={processing}
                                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {processing ? 'Deleting...' : 'Force Delete Now'}
                                        </DangerButton>
                                    </div>
                                </div>
                            ) : (
                                // Password verification mode
                                <form onSubmit={verifyPassword} className="mt-5 space-y-4">
                                    <div className="relative">
                                        <InputLabel htmlFor="password" value="Password" className="sr-only" />
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"} // 👈 Toggle visibility
                                            name="password"
                                            ref={passwordInput}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-lg shadow-sm pr-10"
                                            placeholder="Password"
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={togglePasswordVisibility}
                                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </button>
                                        <InputError message={errors.password} className="mt-2" />
                                    </div>

                                    <div className="flex justify-between gap-3">
                                        <SecondaryButton
                                            type="button"
                                            onClick={closeModal}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded-lg"
                                        >
                                            Cancel
                                        </SecondaryButton>
                                        <DangerButton
                                            type="submit"
                                            disabled={processing}
                                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {processing ? 'Verifying...' : 'Verify & Start Countdown'}
                                        </DangerButton>
                                    </div>
                                </form>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.section>
    );
}
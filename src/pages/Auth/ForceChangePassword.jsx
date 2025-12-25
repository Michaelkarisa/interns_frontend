import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import InputLabel from '@/components/InputLabel';
import TextInput from '@/components/TextInput';
import InputError from '@/components/InputError';
import PrimaryButton from '@/components/PrimaryButton';
import api from '@/api/apiClient';
import { useAuthStore } from '@/Stores/authStore';

export default function ForceChangePassword() {
    const navigate = useNavigate();
    
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [message, setMessage] = useState('');

    const submit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});
        setMessage('');

        try {
            const response = await api.post('/password/force-update', {
                password,
                password_confirmation: passwordConfirmation,
            });

            setMessage(response.data.message || 'Password updated successfully.');

            // Update the auth store with the new user data
            if (response.data.user) {
                useAuthStore.setState({
                    user: response.data.user,
                    forcePasswordChange: false,
                });
            }

            // Clear form
            setPassword('');
            setPasswordConfirmation('');

            // Redirect to dashboard after a short delay
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);

        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else if (error.response?.data?.message) {
                setMessage(error.response.data.message);
            } else {
                setMessage('An error occurred. Please try again.');
            }
        } finally {
            setProcessing(false);
        }
    };

    return (
        <>
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Change Your Password</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        You must set a new password to continue using your account.
                    </p>
                </div>

                {message && (
                    <div className={`mb-4 text-sm font-medium ${
                        message.includes('successfully') ? 'text-green-600' : 'text-red-600'
                    }`}>
                        {message}
                    </div>
                )}

                <form onSubmit={submit} className="w-full max-w-md space-y-5">
                    {/* New Password */}
                    <div className="relative">
                        <InputLabel htmlFor="password" value="New Password" className="text-gray-700" />
                        <div className="mt-1 relative">
                            <TextInput
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                className="w-full pt-2 pb-2 pl-2 pr-10"
                                autoComplete="new-password"
                                autoFocus
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        <InputError message={errors.password?.[0]} className="mt-1" />
                    </div>

                    {/* Confirm Password */}
                    <div className="relative">
                        <InputLabel htmlFor="password_confirmation" value="Confirm Password" className="text-gray-700" />
                        <div className="mt-1 relative">
                            <TextInput
                                id="password_confirmation"
                                type={showConfirm ? 'text' : 'password'}
                                value={passwordConfirmation}
                                className="w-full pt-2 pb-2 pl-2 pr-10"
                                autoComplete="new-password"
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                                onClick={() => setShowConfirm(!showConfirm)}
                            >
                                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        <InputError message={errors.password_confirmation?.[0]} className="mt-1" />
                    </div>

                    <div className="pt-2">
                        <PrimaryButton
                            className="w-full py-3 text-base font-medium flex justify-center items-center"
                            disabled={processing}
                        >
                            {processing ? 'Updating Password...' : 'Update Password'}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </>
    );
}
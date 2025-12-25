import { useState } from 'react';
import axios from 'axios';
import InputError from '@/components/InputError';
import InputLabel from '@/components/InputLabel';
import PrimaryButton from '@/components/PrimaryButton';
import TextInput from '@/components/TextInput';

export default function ResetPassword({ token, email, onAuth }) {
    const [formData, setFormData] = useState({
        token: token || '',
        email: email || '',
        password: '',
        password_confirmation: '',
    });
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState('');
    const [processing, setProcessing] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});
        setStatus('');

        try {
            const response = await axios.post('/api/password/reset', formData, {
                withCredentials: true,
            });

            const { user, force_password_change, message } = response.data;
            setStatus(message || 'Password reset successfully.');

            if (onAuth) onAuth({ user, force_password_change });

            // Redirect if needed
            if (!force_password_change) {
                window.location.href = '/dashboard';
            }
        } catch (error) {
            if (error.response && error.response.data) {
                const data = error.response.data;
                if (data.errors) setErrors(data.errors);
                if (data.message) setStatus(data.message);
            }
        } finally {
            setProcessing(false);
            setFormData({ ...formData, password: '', password_confirmation: '' });
        }
    };

    return (
        <>
            <div className="min-h-screen flex flex-col md:flex-row">
                <div className="flex w-full md:w-1/2 items-center justify-center p-4">
                    <div className="w-full max-w-md">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-700">
                            Reset Your Password
                        </h2>

                        {status && (
                            <div className="mb-4 text-sm font-medium text-green-600">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-4">

                            {/* Email */}
                            <div>
                                <InputLabel htmlFor="email" value="Email" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    className="mt-1 block w-full pt-2 pb-2 pl-2 pr-10"
                                    autoComplete="username"
                                    onChange={(e) =>
                                        setFormData({ ...formData, email: e.target.value })
                                    }
                                    required
                                />
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            {/* Password */}
                            <div>
                                <InputLabel htmlFor="password" value="New Password" />
                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    className="mt-1 block w-full pt-2 pb-2 pl-2 pr-10"
                                    autoComplete="new-password"
                                    onChange={(e) =>
                                        setFormData({ ...formData, password: e.target.value })
                                    }
                                    required
                                />
                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                                <TextInput
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    value={formData.password_confirmation}
                                    className="mt-1 block w-full pt-2 pb-2 pl-2 pr-10"
                                    autoComplete="new-password"
                                    onChange={(e) =>
                                        setFormData({ ...formData, password_confirmation: e.target.value })
                                    }
                                    required
                                />
                                <InputError message={errors.password_confirmation} className="mt-2" />
                            </div>

                            {/* Submit */}
                            <div className="flex justify-end pt-2">
                                <PrimaryButton disabled={processing}>
                                    {processing ? 'Resetting...' : 'Reset Password'}
                                </PrimaryButton>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

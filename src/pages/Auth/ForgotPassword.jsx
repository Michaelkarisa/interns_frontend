import { useState } from 'react';
import axios from 'axios';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';

export default function ForgotPassword({ onAuth }) {
    const [email, setEmail] = useState('');
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});

    const submit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setMessage('');
        setErrors({});

        try {
            const response = await axios.post(
                '/api/password/email',
                { email },
                { withCredentials: true }
            );

            setMessage(response.data.message || 'Password reset link sent.');

            // Optional: update auth state if returned
            if (onAuth && response.data.user) {
                onAuth({ user: response.data.user });
            }

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
            <div className="min-h-screen flex flex-col md:flex-row">
                <div className="flex w-full items-center justify-center p-4">
                    <div className="w-full max-w-md">

                        <h2 className="text-2xl font-semibold mb-4 text-gray-700">
                            Forgot your password?
                        </h2>

                        <p className="mb-4 text-sm text-gray-600">
                            Enter your email and we will send you a reset link.
                        </p>

                        {message && (
                            <div className="mb-4 text-sm font-medium text-green-600">
                                {message}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-2">
                            <div>
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={email}
                                    className="mt-1 block w-full pt-2 pb-2 pl-2 pr-10"
                                    autoFocus
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            <div className="flex justify-end pt-2">
                                <PrimaryButton disabled={processing}>
                                    {processing ? 'Sending...' : 'Email Password Reset Link'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

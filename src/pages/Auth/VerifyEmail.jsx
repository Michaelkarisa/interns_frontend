import { useState } from 'react';
import axios from 'axios';
import PrimaryButton from '@/components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';

export default function VerifyEmail({ status, onAuth }) {
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState(status === 'verification-link-sent' 
        ? 'A new verification link has been sent to your email.' 
        : '');

    const resendVerification = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setMessage('');

        try {
            const response = await axios.post('/api/email/verification-notification', {}, {
                withCredentials: true,
            });

            setMessage(response.data.message || 'Verification email sent.');

            // Call onAuth to update user session if returned
            if (onAuth && response.data.user) {
                onAuth({ user: response.data.user });
            }

        } catch (error) {
            if (error.response?.data?.message) {
                setMessage(error.response.data.message);
            } else {
                setMessage('An error occurred. Please try again.');
            }
        } finally {
            setProcessing(false);
        }
    };

    const logout = async () => {
        try {
            await axios.post('/api/logout', {}, { withCredentials: true });
            if (onAuth) onAuth({ user: null });
            window.location.href = '/';
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <>
            <div className="mb-4 text-sm text-gray-600">
                Thanks for signing up! Before getting started, please verify
                your email address by clicking the link we sent you. If you
                didn’t receive it, you can request another below.
            </div>

            {message && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {message}
                </div>
            )}

            <div className="mt-4 flex items-center justify-between">
                <PrimaryButton onClick={resendVerification} disabled={processing}>
                    {processing ? 'Sending...' : 'Resend Verification Email'}
                </PrimaryButton>

                <button
                    onClick={logout}
                    className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    Log Out
                </button>
            </div>
        </>
    );
}

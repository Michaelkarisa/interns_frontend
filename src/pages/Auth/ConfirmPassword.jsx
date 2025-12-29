import { useState } from 'react';
import InputLabel from '@/components/InputLabel';
import TextInput from '@/components/TextInput';
import InputError from '@/components/InputError';
import PrimaryButton from '@/components/PrimaryButton';
import api from '@/api/apiClient';

export default function ConfirmPassword({ onAuth }) {
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState('');

    const submit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});
        setMessage('');

        try {
            const response = await api.post(
                '/api/password/confirm',
                { password },
                { withCredentials: true }
            );

            setMessage(response.data.message || 'Password confirmed.');

            if (onAuth && response.data.user) {
                onAuth({ user: response.data.user });
            }

            setPassword('');
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
            <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
                <div className="text-center mb-4 text-gray-600">
                    This is a secure area of the application. Please confirm your
                    password before continuing.
                </div>

                {message && (
                    <div className="mb-4 text-sm font-medium text-green-600">{message}</div>
                )}

                <form onSubmit={submit} className="w-full max-w-md space-y-4">
                    <div>
                        <InputLabel htmlFor="password" value="Password" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={password}
                            className="mt-1 block w-full pt-2 pb-2 pl-2 pr-10"
                            autoFocus
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="flex justify-end">
                        <PrimaryButton disabled={processing}>
                            {processing ? 'Confirming...' : 'Confirm'}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </>
    );
}

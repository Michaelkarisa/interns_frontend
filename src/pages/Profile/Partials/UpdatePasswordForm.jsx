// resources/js/Pages/Profile/Partials/UpdatePasswordForm.jsx
import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { Input } from '@/components/ui/input';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const confirmPasswordInput = useRef();
    const currentPasswordInput = useRef();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [passwordStrength, setPasswordStrength] = useState(0);
    const [passwordColor, setPasswordColor] = useState('bg-red-500');
    const [passwordText, setPasswordText] = useState('Very Weak');

    const [formData, setFormData] = useState({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const strength = calculatePasswordStrength(formData.password);
        setPasswordStrength(strength);

        switch (strength) {
            case 0:
            case 1:
                setPasswordColor('bg-red-500');
                setPasswordText('Very Weak');
                break;
            case 2:
                setPasswordColor('bg-orange-500');
                setPasswordText('Weak');
                break;
            case 3:
                setPasswordColor('bg-blue-500');
                setPasswordText('Medium');
                break;
            case 4:
                setPasswordColor('bg-green-500');
                setPasswordText('Strong');
                break;
            default:
                setPasswordColor('bg-red-500');
                setPasswordText('Very Weak');
        }
    }, [formData.password]);

    function calculatePasswordStrength(password) {
        let strength = 0;
        if (password.length >= 6) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return strength;
    }

    const updatePassword = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});
        setSaved(false);

        try {
            await axios.put('/user/password', {
                current_password: formData.current_password,
                password: formData.password,
                password_confirmation: formData.password_confirmation,
            });
            setFormData({ current_password: '', password: '', password_confirmation: '' });
            setSaved(true);
        } catch (error) {
            if (error.response && error.response.data?.errors) {
                setErrors(error.response.data.errors);

                if (error.response.data.errors.current_password) {
                    currentPasswordInput.current.focus();
                } else if (error.response.data.errors.password) {
                    passwordInput.current.focus();
                }
            } else {
                console.error(error);
                alert('Something went wrong. Please try again.');
            }
        } finally {
            setProcessing(false);
        }
    };

    return (
        <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`bg-white rounded-2xl shadow-sm p-6 ${className}`}
        >
            <header>
                <h2 className="text-lg font-semibold text-gray-900">Update Password</h2>
                <p className="mt-1 text-sm text-gray-600">
                    Ensure your account is using a long, random password to stay secure.
                </p>
            </header>

            <form onSubmit={updatePassword} className="mt-6 space-y-5">
                {/* CURRENT PASSWORD */}
                <div>
                    <InputLabel htmlFor="current_password" value="Current Password" />
                    <Input
                        id="current_password"
                        ref={currentPasswordInput}
                        value={formData.current_password}
                        onChange={(e) =>
                            setFormData({ ...formData, current_password: e.target.value })
                        }
                        type="password"
                        className="mt-2 block w-1/2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                        autoComplete="current-password"
                    />
                    <InputError message={errors.current_password} className="mt-2" />
                </div>

                {/* NEW PASSWORD */}
                <div className="relative">
                    <InputLabel htmlFor="password" value="New Password" />
                    <Input
                        id="password"
                        ref={passwordInput}
                        value={formData.password}
                        onChange={(e) =>
                            setFormData({ ...formData, password: e.target.value })
                        }
                        type={showPassword ? 'text' : 'password'}
                        className="mt-2 block w-1/2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg pr-10"
                        autoComplete="new-password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-11 text-gray-500 hover:text-gray-700"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    <InputError message={errors.password} className="mt-2" />

                    {/* PASSWORD STRENGTH METER */}
                    <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">Password Strength</p>
                        <div className="mt-1 h-2 w-full bg-gray-300 rounded">
                            <div
                                className={`${passwordColor} h-2 rounded`}
                                style={{ width: `${(passwordStrength / 4) * 100}%` }}
                            ></div>
                        </div>
                        <p className="text-sm mt-1 text-gray-700">{passwordText}</p>
                    </div>
                </div>

                {/* CONFIRM PASSWORD */}
                <div className="relative">
                    <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                    <Input
                        id="password_confirmation"
                        ref={confirmPasswordInput}
                        value={formData.password_confirmation}
                        onChange={(e) =>
                            setFormData({ ...formData, password_confirmation: e.target.value })
                        }
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="mt-2 block w-1/2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg pr-10"
                        autoComplete="new-password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-11 text-gray-500 hover:text-gray-700"
                    >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                {/* FOOTER BUTTON */}
                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing} className="px-5 py-2 rounded-lg">
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

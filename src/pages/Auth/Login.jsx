import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '@/Stores/authStore';
import { Checkbox } from '@/Layouts/checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Link, useLocation, useNavigate } from "react-router-dom";
export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('');
  const [processing, setProcessing] = useState(false);

  const setAuth = useAuthStore((state) => state.setAuth); // Zustand store
 const login = useAuthStore((state) => state.login);
  const location = useLocation();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});
    setStatus('');

    try {
      
       const response = await login(formData);
      const { user, token } = response.data;
          console.log('Login response:', response.data);
      setStatus(message);
      navigate("/dashboard");
  
    } catch (error) {
      if (error.response?.data) {
        const data = error.response.data;
        if (data.errors) setErrors(data.errors);
        if (data.message) setStatus(data.message);
        console.log('Login error:', data);
      }
    } finally {
      setProcessing(false);
      setFormData({ ...formData, password: '' });
    }
  };

  return (
    <div className="flex w-full items-center justify-center p-4">
      <div className="w-full max-w-md text-gray-700">
        {status && (
          <div className="mb-4 text-sm font-medium text-green-600">{status}</div>
        )}

        <form onSubmit={submit} className="space-y-2">
          {/* EMAIL */}
          <div>
            <InputLabel htmlFor="email" value="Email" />
            <TextInput
              id="email"
              type="email"
              name="email"
              value={formData.email}
              className="mt-1 block w-full pt-2 pb-2 pl-2 pr-10 bg-transparent border-b border-gray-400 focus:border-indigo-500 focus:ring-0"
              autoComplete="username"
              isFocused
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <InputError message={errors.email} className="mt-2" />
          </div>

          {/* PASSWORD */}
          <div className="relative">
            <InputLabel htmlFor="password" value="Password" />
            <TextInput
              id="password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              className="mt-1 block w-full pt-2 pb-2 pl-2 pr-10 bg-transparent border-b border-gray-400 focus:border-indigo-500 focus:ring-0"
              autoComplete="current-password"
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-9 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            <InputError message={errors.password} className="mt-2" />
          </div>

          {/* REMEMBER ME */}
          <div className="block">
            <label className="flex items-center">
              <Checkbox
                name="remember"
                checked={formData.remember}
                onChange={(e) =>
                  setFormData({ ...formData, remember: e.target.checked })
                }
              />
              <span className="ms-2 text-sm text-gray-900">Remember me</span>
            </label>
          </div>

          {/* ACTIONS */}
         <div className="flex items-center justify-between pt-2">
                                <Link
                                    to={'/forgot-password'}
                                    className="rounded-md text-sm text-gray-600 underline hover:text-gray-900"
                                >
                                    forget password?
                                </Link>
                                  <PrimaryButton disabled={processing}>
                                                                {processing ? 'Loging in...' : 'Login'}
                                                            </PrimaryButton>
                            </div>
        </form>
      </div>
    </div>
  );
}

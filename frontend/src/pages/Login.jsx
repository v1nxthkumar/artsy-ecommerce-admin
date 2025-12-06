import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import Title from '../components/Title';

const Login = () => {
  const [currentState, setCurrentState] = useState('login');
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Toggle password visibility
  const togglePassword = () => setShowPassword(prev => !prev);
  const toggleConfirm = () => setShowConfirm(prev => !prev);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    if (currentState === 'signup') {
      if (!formData.name) {
        newErrors.name = 'Name is required';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const endpoint = currentState === 'signup' ? '/api/user/register' : '/api/user/login';
      const payload = currentState === 'signup'
        ? { name: formData.name, email: formData.email, password: formData.password }
        : { email: formData.email, password: formData.password };

      const response = await axios.post(`${backendUrl}${endpoint}`, payload);

      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem('token', response.data.token);
        toast.success(`${currentState === 'signup' ? 'Account created' : 'Logged in'} successfully`);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error('No Google credential provided');
      return;
    }

    setGoogleLoading(true);

    try {
      const response = await axios.post(`${backendUrl}/api/user/google-login`, {
        credential: credentialResponse.credential,
      });

      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem('token', response.data.token);
        toast.success('Logged in with Google');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log('Google login error:', error);
      toast.error('Google login failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [token]);

  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center">
          <div>
            {currentState === 'login' ? <Title
              lead="Exclusive Entry"
              headline="Members Only"
              subline="The Door is Open"
            />
              : <Title
                lead="Your Style Journey Starts Here"
                headline="Join Us"
                subline="Curated Exclusives. Members Only."
              />
            }
          </div>
        </div>

        <div className="bg-white py-8 px-6 sm:px-10">
          <form onSubmit={onSubmitHandler} className="space-y-6">
            {currentState === 'signup' && (
              <div>
                <label htmlFor="name" className="block text-sm font-normal text-gray-700 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="mt-1 relative">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className={`block w-full px-3 py-2.5 border-b ${errors.name ? 'border-black' : 'border-gray-300'} focus:border-black focus:outline-none bg-transparent text-sm`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-gray-600">{errors.name}</p>
                  )}
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-normal text-gray-700 uppercase tracking-wider">
                Email
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full px-3 py-2.5 border-b ${errors.email ? 'border-black' : 'border-gray-300'} focus:border-black focus:outline-none bg-transparent text-sm`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-gray-600">{errors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-normal text-gray-700 uppercase tracking-wider">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full px-3 py-2.5 border-b ${errors.password ? 'border-black' : 'border-gray-300'} focus:border-black focus:outline-none bg-transparent text-sm pr-10`}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-black"
                  onClick={togglePassword}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                {errors.password && (
                  <p className="mt-1 text-xs text-gray-600">{errors.password}</p>
                )}
              </div>
            </div>

            {currentState === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-normal text-gray-700 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`block w-full px-3 py-2.5 border-b ${errors.confirmPassword ? 'border-black' : 'border-gray-300'} focus:border-black focus:outline-none bg-transparent text-sm pr-10`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-black"
                    onClick={toggleConfirm}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-gray-600">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              {currentState === 'login' && (
                <div className="text-xs">
                  <a href="/forgot-password" className="font-light hover:underline">
                    Forgot password?
                  </a>
                </div>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-black rounded-sm text-sm font-light hover:bg-black hover:text-white transition-all duration-200"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                ) : (
                  <span className="flex items-center">
                    {currentState === 'login' ? 'Sign in' : 'Create account'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-gray-500 uppercase tracking-wider">
                  Or
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleLogin}
                  onError={() => toast.error('Google Login Failed')}
                  theme="outline"
                  text="continue_with"
                  size="large"
                  shape="rectangular"
                  width="310"
                />
                {googleLoading && (
                  <div className="flex justify-center">
                    <Loader2 className="animate-spin h-5 w-5" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-xs">
            <button
              onClick={() => setCurrentState(currentState === 'login' ? 'signup' : 'login')}
              className="font-light hover:underline"
            >
              {currentState === 'login'
                ? 'Need an account? Sign up'
                : 'Already registered? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

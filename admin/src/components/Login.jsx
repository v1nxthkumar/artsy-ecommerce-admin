import axios from 'axios';
import React, { useState } from 'react';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { FiKey, FiMail, FiEye, FiEyeOff, FiLock } from 'react-icons/fi';
import { RiShieldKeyholeLine } from 'react-icons/ri';
import { motion } from 'framer-motion';
import { assets } from '../assets/assets';

const Login = ({ setToken }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [activeField, setActiveField] = useState(null);

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await axios.post(`${backendUrl}/api/user/admin/login`, {
                email,
                password,
            });

            if (response.data.success && response.data.token) {
                const token = response.data.token;
                localStorage.setItem('adminToken', token); // store token
                setToken(token); // update state
                toast.success('Login successful');
                // optionally redirect, e.g. window.location.href = "/admin/dashboard"
            } else {
                toast.error(response.data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error(error.response?.data?.message || error.message || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 overflow-hidden">
            <motion.div
                className="backdrop-blur-xl bg-white/90 shadow-xl rounded-2xl p-8 max-w-md w-full border border-white/20 relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-black/5 rounded-full blur-xl"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-black/5 rounded-full blur-xl"></div>

                <div className="relative z-10 text-center mb-8">
                    <motion.div
                        className="mx-auto w-16 h-16 bg-black/5 rounded-2xl flex items-center justify-center mb-4"
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 8, repeat: Infinity, repeatType: 'reverse' }}
                    >
                        <img className='w-12' src={assets.logo} alt="logo" />
                    </motion.div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin Portal</h1>
                    <p className="text-gray-500 text-sm">Secure system access</p>
                </div>

                <form onSubmit={onSubmitHandler} className="space-y-5">
                    {/* Email Input */}
                    <div>
                        <label className="flex items-center mb-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <FiMail className="text-gray-500 mr-2 text-sm" />
                            Email
                        </label>
                        <input
                            type="email"
                            placeholder="admin@example.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onFocus={() => setActiveField('email')}
                            onBlur={() => setActiveField(null)}
                            className={`w-full px-4 py-3 rounded-xl border ${
                                activeField === 'email' ? 'border-black/30' : 'border-gray-200'
                            } bg-white/80 focus:outline-none focus:ring-1 focus:ring-black/20 transition-all duration-200`}
                        />
                    </div>

                    {/* Password Input */}
                    <div>
                        <label className="flex items-center mb-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <FiKey className="text-gray-500 mr-2 text-sm" />
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setActiveField('password')}
                                onBlur={() => setActiveField(null)}
                                className={`w-full px-4 py-3 rounded-xl border ${
                                    activeField === 'password' ? 'border-black/30' : 'border-gray-200'
                                } bg-white/80 focus:outline-none focus:ring-1 focus:ring-black/20 transition-all duration-200`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                            >
                                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                        type="submit"
                        disabled={isLoading}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 rounded-xl bg-black hover:bg-gray-800 text-white transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <FiLock size={16} />
                                <span>Sign In</span>
                            </>
                        )}
                    </motion.button>

                    {/* Help Link */}
                    <div className="text-center pt-2">
                        <a href="#" className="text-xs text-gray-500 hover:text-black transition-colors">
                            Need help accessing your account?
                        </a>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;

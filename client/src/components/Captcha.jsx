import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import axios from 'axios';

const Captcha = ({ onCaptchaChange, error }) => {
    const [captchaData, setCaptchaData] = useState(null);
    const [answer, setAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchCaptcha = async () => {
        setIsRefreshing(true);
        setIsLoading(true);
        setAnswer(''); // Clear previous answer

        try {
            const response = await axios.get('http://localhost:5001/api/captcha/generate', {
                withCredentials: true
            });

            if (response.data.success) {
                setCaptchaData(response.data.captcha);
                // komponen induk dengan captchaId dan jawaban kosong
                onCaptchaChange(response.data.captcha.captchaId, '');
            }
        } catch (error) {
            console.error('Failed to fetch CAPTCHA:', error);
        } finally {
            setIsLoading(false);
            setTimeout(() => setIsRefreshing(false), 300); // Smooth animation
        }
    };

    useEffect(() => {
        fetchCaptcha();
    }, []);

    const handleAnswerChange = (e) => {
        const value = e.target.value;
        setAnswer(value);
        if (captchaData) {
            onCaptchaChange(captchaData.captchaId, value);
        }
    };

    const handleRefresh = () => {
        fetchCaptcha();
    };

    const renderCaptchaDisplay = () => {
        if (!captchaData) return null;

        if (captchaData.type === 'math') {
            return (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6 border-2 border-indigo-200 shadow-inner">
                    <div className="text-center">
                        <p className="text-sm text-gray-600 mb-3 font-medium">Solve this equation:</p>
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 py-2 font-mono tracking-wider">
                            {captchaData.question} = ?
                        </div>
                    </div>
                </div>
            );
        } else if (captchaData.type === 'text') {
            return (
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6 border-2 border-blue-200 shadow-inner">
                    <div className="text-center">
                        <p className="text-sm text-gray-600 mb-3 font-medium">Type the characters below:</p>
                        <div className="relative inline-block">
                            {/* Background patterns for visual noise */}
                            <div className="absolute inset-0 opacity-10">
                                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="gray" strokeWidth="0.5" />
                                        </pattern>
                                    </defs>
                                    <rect width="100%" height="100%" fill="url(#grid)" />
                                </svg>
                            </div>

                            {/* CAPTCHA text with styling */}
                            <div className="relative flex gap-2 px-6 py-3">
                                {captchaData.text.split('').map((char, index) => (
                                    <span
                                        key={index}
                                        className="text-4xl font-bold text-gray-800 font-mono"
                                        style={{
                                            transform: `rotate(${Math.random() * 20 - 10}deg) translateY(${Math.random() * 8 - 4}px)`,
                                            display: 'inline-block',
                                            textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                                            color: `hsl(${200 + index * 15}, 70%, ${40 + Math.random() * 20}%)`
                                        }}
                                    >
                                        {char}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
                Security Verification
            </label>

            {/* CAPTCHA Display */}
            <div className="relative">
                {isLoading && !captchaData ? (
                    <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center border-2 border-gray-200">
                        <div className="flex items-center gap-3 text-gray-500">
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            <span className="text-sm font-medium">Loading CAPTCHA...</span>
                        </div>
                    </div>
                ) : (
                    <>
                        {renderCaptchaDisplay()}

                        {/* Refresh Button Overlay */}
                        <button
                            type="button"
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200"
                            title="Refresh CAPTCHA"
                        >
                            <RefreshCw
                                className={`w-4 h-4 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`}
                            />
                        </button>
                    </>
                )}
            </div>

            {/* Answer Input */}
            <div className="relative">
                <input
                    type="text"
                    value={answer}
                    onChange={handleAnswerChange}
                    placeholder="Enter your answer"
                    className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ${error ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'
                        }`}
                    disabled={isLoading}
                />
                {captchaData?.type === 'math' && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <span className="text-gray-400 text-sm">
                            🔢
                        </span>
                    </div>
                )}
                {captchaData?.type === 'text' && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <span className="text-gray-400 text-sm">
                            🔤
                        </span>
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}

            {/* Helper Text */}
            <p className="text-xs text-gray-500">
                {captchaData?.type === 'math'
                    ? 'Calculate the result and enter the number'
                    : 'Enter the characters shown above (case-insensitive)'}
            </p>
        </div>
    );
};

export default Captcha;

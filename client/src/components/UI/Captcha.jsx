import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { RefreshCw } from 'lucide-react';

const Captcha = ({ onCaptchaChange, value, error, regenerateCaptcha }) => {
  const [captchaData, setCaptchaData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [captchaText, setCaptchaText] = useState('');
  const canvasRef = useRef(null);

  const generateCaptcha = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching captcha from API...');
      const response = await axios.get('http://localhost:3000/api/captcha', {
        withCredentials: true
      });
      
      console.log('Captcha API response:', response.data);
      
      if (response.data.success) {
        const { text, expiresAt } = response.data.captcha;
        setCaptchaData({ text, expiresAt });
        setCaptchaText(text);
        drawCaptcha(text);
        onCaptchaChange(''); // Reset input
      }
    } catch (error) {
      console.error('Failed to generate captcha:', error);
      generateFallbackCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let text = '';
    for (let i = 0; i < 6; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    setCaptchaData({ text, expiresAt: expiresAt.toISOString() });
    setCaptchaText(text);
    drawCaptcha(text);
    onCaptchaChange('');
    
    console.log('Fallback captcha generated:', text);
  };

  const drawCaptcha = (text) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('Canvas not found');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Canvas context not available');
      return;
    }

    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
   
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    
    for (let i = 0; i < 8; i++) {
      ctx.strokeStyle = `rgba(${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 100}, 0.3)`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }
    
    
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 100}, 0.2)`;
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    
    
    ctx.font = 'bold 24px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const x = 25 + i * 20;
      const y = 20 + Math.random() * 8;
      
      
      ctx.fillStyle = `rgb(${50 + Math.random() * 150}, ${50 + Math.random() * 150}, ${50 + Math.random() * 150})`;
      
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((Math.random() - 0.5) * 0.4);
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }

    console.log('Captcha drawn on canvas:', text);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  useEffect(() => {
    if (regenerateCaptcha) {
      generateCaptcha();
    }
  }, [regenerateCaptcha]);

  const handleRefresh = () => {
    generateCaptcha();
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    
    // Hanya huruf dan angka, tidak auto uppercase
    const filteredValue = value.replace(/[^A-Za-z0-9]/g, '');
    
    console.log('Captcha input changed:', filteredValue);
    onCaptchaChange(filteredValue);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Security Verification *
      </label>
      
      {/* Captcha Display */}
      <div className="flex items-center justify-between p-4 bg-white border border-gray-300 rounded-lg">
        <div className="flex items-center space-x-4">
          <canvas
            ref={canvasRef}
            width="150"
            height="50"
            className="border border-gray-300 rounded bg-white"
          />
          <div className="text-sm text-gray-600">
            <div>Enter the code shown</div>
            <div className="text-xs text-gray-500 mt-1">
              {captchaData ? `Expires: ${new Date(captchaData.expiresAt).toLocaleTimeString()}` : 'Loading...'}
            </div>
          </div>
        </div>
        
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isLoading}
          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
          title="Refresh code"
        >
          <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Captcha Input */}
      <div>
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder="Type the code exactly as shown"
          className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 font-mono ${
            error ? 'border-red-500 ring-2 ring-red-200 bg-red-50' : 'border-gray-300'
          }`}
          maxLength={6}
          autoComplete="off"
          style={{ letterSpacing: '1px', textTransform: 'none' }} // Jangan auto uppercase
        />
        {error && (
          <p className="mt-2 text-sm text-red-600 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
        
        {/* Instruction */}
        <div className="mt-1 text-xs text-gray-500">
          Type the code exactly as shown above (case sensitive)
        </div>
      </div>

      {/* Debug Info (Hapus di production) */}
      {process.env.NODE_ENV === 'development' && captchaText && (
        <div className="text-xs text-gray-400 bg-gray-100 p-2 rounded">
          Debug: Captcha text = "{captchaText}"
        </div>
      )}
    </div>
  );
};

export default Captcha;
import React, { useRef, useEffect } from 'react';

const Captcha = ({ captchaText, onRegenerate, width = 200, height = 80 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    drawCaptcha();
  }, [captchaText]);

  const drawCaptcha = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);
    
    // Add noise - dots
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.2)`;
      ctx.beginPath();
      ctx.arc(
        Math.random() * width,
        Math.random() * height,
        Math.random() * 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    
    // Add noise - lines
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.3)`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.stroke();
    }
    
    // Draw text
    const text = captchaText;
    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = '#333';
    
    // Text distortion
    for (let i = 0; i < text.length; i++) {
      const x = 20 + i * 25;
      const y = 50 + Math.random() * 10 - 5;
      const rotation = Math.random() * 0.4 - 0.2;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.fillText(text[i], 0, 0);
      ctx.restore();
    }
  };

   return (
    <div className="captcha-container">
      <div className="captcha-display">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="captcha-canvas"
        />
        <button
          type="button"
          onClick={onRegenerate}
          className="captcha-refresh-btn"
        >
          🔄
        </button>
      </div>
    </div>
  );
};

export default Captcha;
import { useState, useEffect } from 'react';

function Captcha() {
  const [captchaImage, setCaptchaImage] = useState('');
  const [userInput, setUserInput] = useState('');
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch CAPTCHA baru
  const fetchCaptcha = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/captcha', {
        credentials: 'include'
      });
      const svg = await response.text();
      setCaptchaImage(`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`);
      setUserInput('');
      setVerified(false);
      setError('');
    } catch (err) {
      console.error('Error fetching CAPTCHA:', err);
      setError('Gagal memuat CAPTCHA');
    } finally {
      setLoading(false);
    }
  };

  // Load CAPTCHA saat komponen mount
  useEffect(() => {
    fetchCaptcha();
  }, []);

  // Verifikasi jawaban user
  const verifyCaptcha = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userInput })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setVerified(true);
        setError('');
      } else {
        setError('Kode CAPTCHA salah!');
        fetchCaptcha(); // Refresh CAPTCHA jika salah
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('Terjadi kesalahan verifikasi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="captcha-container">
      <h2>Verifikasi CAPTCHA</h2>
      
      <div className="captcha-display">
        <img 
          src={captchaImage} 
          alt="CAPTCHA" 
          style={{ 
            backgroundColor: '#f0f0f0',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }} 
        />
        <button 
          onClick={fetchCaptcha} 
          disabled={loading}
          style={{ marginLeft: '10px' }}
        >
          {loading ? 'Memuat...' : 'Refresh'}
        </button>
      </div>

      <form onSubmit={verifyCaptcha}>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Masukkan kode di atas"
          required
          disabled={loading || verified}
          style={{ 
            padding: '8px',
            margin: '10px 0',
            width: '200px'
          }}
        />
        <button 
          type="submit"
          disabled={loading || verified}
          style={{ padding: '8px 16px' }}
        >
          {loading ? 'Memeriksa...' : 'Verifikasi'}
        </button>
      </form>

      {verified && (
        <div style={{ color: 'green', marginTop: '10px' }}>
          ✅ Verifikasi berhasil!
        </div>
      )}

      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          ❌ {error}
        </div>
      )}
    </div>
  );
}

export default Captcha;
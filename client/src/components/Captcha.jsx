import ReCAPTCHA from 'react-google-recaptcha';

const Captcha = ({ onVerify, siteKey }) => {
  const handleCaptchaChange = (value) => {
    onVerify(value);
  };

  return (
    <div className="captcha-container">
      <ReCAPTCHA
        sitekey={siteKey}
        onChange={handleCaptchaChange}
        theme="light"
      />
    </div>
  );
};

export default Captcha;
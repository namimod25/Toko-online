import svGCaptha from 'svg-captcha';

export const generateCaptcha = (req, res) => {
    const captcha = svGCaptha.create({
        size: 6,
        noise: 2,
        color: true,
        background: '#f0f0f0'
    });

    //simpan teks captcha di session
    req.session.captcha = captcha.text;
    res.type('svg');
    res.status(200).send(captcha.data);
};

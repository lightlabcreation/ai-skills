import CryptoJS from 'crypto-js';

const secretKey = process.env.SECRET_KEY;

export const encodeToken = async(data) => {
    const stringifiedData = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(stringifiedData, secretKey).toString();
    return encrypted;
};

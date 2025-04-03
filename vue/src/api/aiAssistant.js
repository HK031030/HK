// aiAssistant.js - Updated version according to documentation
import CryptoJS from 'crypto-js';

export async function getSparkAccessToken() {
  const appId = import.meta.env.VITE_SPARK_APP_ID;
  const apiKey = import.meta.env.VITE_SPARK_API_KEY;
  const apiSecret = import.meta.env.VITE_SPARK_API_SECRET;

  if (!appId || !apiKey || !apiSecret) {
    throw new Error('缺少必要的环境变量：VITE_SPARK_APP_ID, VITE_SPARK_API_KEY 或 VITE_SPARK_API_SECRET');
  }
  
  // 请求URL参数拼接
  const host = 'spark-api.xf-yun.com';
  const date = new Date().toGMTString();
  console.log(new Date().toGMTString()); 

  const algorithm = 'hmac-sha256';
  const headers = 'host date request-line';
  const requestLine = 'GET /v4.0/chat HTTP/1.1';
  
  // 签名生成
  const signatureOrigin = `host: ${host}\ndate: ${date}\n${requestLine}`;
  const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret);
  console.log("API Secret:", apiSecret);

  const signature = CryptoJS.enc.Base64.stringify(signatureSha);
  console.log("Signature:", signature);

  // 构建授权URL参数
  const authorizationOrigin = `api_key="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`;
  const authorization = btoa(authorizationOrigin);
  
  // 日志调试
  console.log('Date:', date);
  console.log('API Secret:', apiSecret);
  console.log('Signature:', signature);
  console.log('Authorization:', authorization);
  return {
    appId,
    host,
    date,
    authorization
  };
}

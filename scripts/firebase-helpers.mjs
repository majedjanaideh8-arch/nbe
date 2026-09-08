import { readdirSync, readFileSync, existsSync } from 'fs';
import { createSign } from 'crypto';

/**
 * يقرأ متغيرات ملف .env تلقائياً
 */
export function getEnvConfig() {
  const config = {};
  if (existsSync('./.env')) {
    const lines = readFileSync('./.env', 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        config[key] = val;
      }
    }
  }
  return config;
}

/**
 * يبحث تحديداً عن ملف nbe.json في جذر المشروع
 */
export function findServiceAccountPath() {
  const saPath = './nbe.json';
  if (!existsSync(saPath)) {
    throw new Error('❌ لم يتم العثور على ملف [ nbe.json ] في المجلد الرئيسي للمشروع. يرجى وضع مفتاح الخدمة باسم nbe.json في جذر المشروع.');
  }

  try {
    const data = JSON.parse(readFileSync(saPath, 'utf8'));
    if (!data || data.type !== 'service_account' || !data.private_key || !data.client_email) {
      throw new Error('❌ ملف nbe.json غير صالح أو تنقصه بيانات الاعتماد (private_key أو client_email).');
    }
    return saPath;
  } catch (err) {
    throw new Error(`❌ خطأ في قراءة ملف nbe.json: ${err.message}`);
  }
}

/**
 * توليد Google OAuth2 Access Token باستخدام مفتاح الخدمة
 */
export async function getAccessToken(serviceAccountPath) {
  const sa = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.database https://www.googleapis.com/auth/identitytoolkit https://www.googleapis.com/auth/userinfo.email',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const b64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signInput = `${b64Header}.${b64Payload}`;

  const signer = createSign('RSA-SHA256');
  signer.update(signInput);
  const signature = signer.sign(sa.private_key, 'base64url');
  const jwt = `${signInput}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`
  });

  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data.access_token;
}

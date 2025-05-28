import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import https from 'https';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SSL_OP_LEGACY_SERVER_CONNECT } from 'constants';

import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

const customFetch = async (url, options = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const agent = process.env.HTTPS_PROXY 
      ? new HttpsProxyAgent(process.env.HTTPS_PROXY)
      : new https.Agent({ 
          keepAlive: true,
          rejectUnauthorized: false,
          secureOptions: SSL_OP_LEGACY_SERVER_CONNECT
        });

    const response = await fetch(url, {
      ...options,
      agent,
      signal: controller.signal,
      headers: {
        ...options.headers,
        'Connection': 'keep-alive'
      }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response;
  } finally {
    clearTimeout(timeout);
  }
};

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    global: {
      fetch: customFetch,
      headers: {
        'Accept-Encoding': 'gzip, deflate',
        'Cache-Control': 'no-cache'
      }
    }
  }
);

(async () => {
  try {
    console.log('Testing Supabase connection...');
    const { error } = await supabase
      .from('Usuarios')
      .select('*')
      .limit(1);
    
    if (error) throw error;
    console.log('✅ Supabase connection successful!');
  } catch (err) {
    console.error('❌ Connection failed:', err);
  }
})();

export default supabase;
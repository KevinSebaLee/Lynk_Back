import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import https from 'https';
import { HttpsProxyAgent } from 'https-proxy-agent';
import dns from 'dns';
import crypto from 'crypto'; // Import crypto to access SSL constants

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
          // Use crypto.constants instead of require('constants')
          secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT
        });

    // Add required authentication headers
    const headers = new Headers(options.headers);
    headers.set('apikey', process.env.SUPABASE_SERVICE_ROLE_KEY);
    headers.set('Authorization', `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`);
    headers.set('Connection', 'keep-alive');

    const response = await fetch(url, {
      ...options,
      agent,
      signal: controller.signal,
      headers
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorBody}`);
    }
    
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
    console.log('Supabase URL:', process.env.SUPABASE_URL);
    console.log('Supabase Key:', process.env.SUPABASE_SERVICE_ROLE_KEY 
      ? '***' + process.env.SUPABASE_SERVICE_ROLE_KEY.slice(-4) 
      : 'MISSING');
    
    // Test basic API access
    const testRes = await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY
      }
    });
    console.log(`Basic API test: ${testRes.status} ${testRes.statusText}`);
    
    // // Test Supabase client query
    // const { data, error } = await supabase
    //   .from('Usuarios')
    //   .select('*')
    //   .limit(1);
    
    // if (error) throw error;
    // console.log('✅ Supabase connection successful!');
    // console.log('Sample data:', data);
  } catch (err) {
    console.error('❌ Connection failed:', {
      message: err.message,
      stack: err.stack
    });
    
    // Additional diagnostics
    try {
      const lookup = await dns.promises.lookup(new URL(process.env.SUPABASE_URL).hostname);
      console.log('DNS Lookup:', lookup);
    } catch (dnsErr) {
      console.error('DNS Error:', dnsErr);
    }
  }
})();

export default supabase;
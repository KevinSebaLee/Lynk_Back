import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;
import dns from 'dns';

const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
});

(async () => {
  try {
    console.log('Testing PostgreSQL connection...');
    console.log('PGHOST:', process.env.PGHOST);
    console.log('PGUSER:', process.env.PGUSER);
    console.log('PGDATABASE:', process.env.PGDATABASE);
    console.log('PGPORT:', process.env.PGPORT);
    console.log('PGPASSWORD:', process.env.PGPASSWORD ? '***HIDDEN***' : 'MISSING');

    // Test basic connection and query
    const client = await pool.connect();
    console.log('✅ PostgreSQL connection successful!');
    client.release();
  } catch (err) {
    console.error('❌ Connection failed:', {
      message: (err as Error).message,
      stack: (err as Error).stack
    });

    // Additional diagnostics
    try {
      const lookup = await dns.promises.lookup(process.env.PGHOST || 'localhost');
      console.log('DNS Lookup:', lookup);
    } catch (dnsErr) {
      console.error('DNS Error:', dnsErr);
    }
  }
})();

export default pool;
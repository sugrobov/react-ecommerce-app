import pg from 'pg';
const { Pool } = pg;

const poolConfig = {
    connectionString: process.env.DATABASE_URL
};

// Включаем SSL только для продакшена (Render)
if (process.env.NODE_ENV === 'production') {
    poolConfig.ssl = {
        rejectUnauthorized: false
    };
}

const pool = new Pool(poolConfig);


export const query = (text, params) => pool.query(text, params);
export default pool;
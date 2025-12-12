import { query } from './db.js';

async function migrate() {
    console.log('Running database migration...');
    try {
        // 1. Создаем таблицу products
        await query(`
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                price DECIMAL(10, 2) NOT NULL,
                category_id INTEGER,
                image_url VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Table "products" created or already exists.');

        // 2. (Опционально) Создаем таблицу categories для связей
        await query(`
            CREATE TABLE IF NOT EXISTS categories (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE
            );
        `);
        console.log('✅ Table "categories" created or already exists.');

        // 3. Заполняем categories тестовыми данными, если таблица пуста
        const catResult = await query('SELECT COUNT(*) FROM categories');
        if (parseInt(catResult.rows[0].count) === 0) {
            await query(`
                INSERT INTO categories (name) VALUES
                ('Электроника'),
                ('Одежда'),
                ('Книги'),
                ('Для дома'),
                ('Спорт')
            `);
            console.log('✅ Test categories inserted.');
        }

        console.log('🎉 Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

// Запускаем миграцию
migrate();
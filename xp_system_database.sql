-- Система покупки XP за XTR (Telegram Stars)
-- База данных PostgreSQL

-- Пользователи (тестовая версия) - tgid как первичный ключ
CREATE TABLE xtr_test_users (
    tgid BIGINT PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    username TEXT,
    current_xp BIGINT DEFAULT 0,
    total_xp_purchased BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Товары XP
CREATE TABLE xp_test_products (
    product_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    xp_amount BIGINT NOT NULL,
    price_xtr INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Транзакции XP покупок (ссылаемся на tgid напрямую)
CREATE TABLE xp_test_transactions (
    transaction_id SERIAL PRIMARY KEY,
    tgid BIGINT NOT NULL REFERENCES xtr_test_users(tgid),
    product_id INTEGER NOT NULL REFERENCES xp_test_products(product_id),
    xp_amount BIGINT NOT NULL,
    price_xtr INTEGER NOT NULL,
    status TEXT CHECK (status IN ('pending','invoice_sent','completed','failed','refunded')) DEFAULT 'pending',
    provider_tx_id TEXT,
    telegram_payment_charge_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Функция для обновления XP пользователя при успешной покупке
CREATE OR REPLACE FUNCTION update_user_xp_on_purchase()
RETURNS TRIGGER AS $$
BEGIN
    -- Обновляем XP пользователя только при успешном завершении транзакции
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        UPDATE xtr_test_users 
        SET 
            current_xp = current_xp + NEW.xp_amount,
            total_xp_purchased = total_xp_purchased + NEW.xp_amount
        WHERE tgid = NEW.tgid;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматического обновления XP
CREATE TRIGGER trigger_update_user_xp
    AFTER UPDATE ON xp_test_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_xp_on_purchase();

-- Представление для детальной информации о транзакциях
CREATE VIEW xp_transaction_details AS
SELECT 
    t.transaction_id,
    t.tgid,
    u.first_name,
    u.username,
    p.name as product_name,
    t.xp_amount,
    t.price_xtr,
    t.status,
    t.created_at,
    t.completed_at
FROM xp_test_transactions t
JOIN xtr_test_users u ON t.tgid = u.tgid
JOIN xp_test_products p ON t.product_id = p.product_id;

-- Вставка тестовых товаров
INSERT INTO xp_test_products (name, description, xp_amount, price_xtr) VALUES
('Стартовый пакет', '5,000 XP за 100 XTR', 5000, 100),
('Базовый пакет', '10,000 XP за 200 XTR', 10000, 200),
('Стандартный пакет', '15,000 XP за 300 XTR', 15000, 300),
('Продвинутый пакет', '20,000 XP за 400 XTR', 20000, 400),
('Премиум пакет', '100,000 XP за 860 XTR', 100000, 860),
('Элитный пакет', '200,000 XP за 1,660 XTR', 200000, 1660),
('VIP пакет', '500,000 XP за 4,390 XTR', 500000, 4390),
('Легендарный пакет', '1,000,000 XP за 6,420 XTR', 1000000, 6420);

-- Индексы для оптимизации
CREATE INDEX idx_transactions_tgid ON xp_test_transactions(tgid);
CREATE INDEX idx_transactions_status ON xp_test_transactions(status);
CREATE INDEX idx_transactions_created_at ON xp_test_transactions(created_at);
CREATE INDEX idx_users_tgid ON xtr_test_users(tgid);
CREATE INDEX idx_products_active ON xp_test_products(is_active);

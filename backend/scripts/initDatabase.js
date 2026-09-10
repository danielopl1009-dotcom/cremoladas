import { initDB } from '../config/database.js';

const run = async () => {
  try {
    const pool = await initDB();
    console.log('Creando tablas...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id         SERIAL PRIMARY KEY,
        name       VARCHAR(100) NOT NULL,
        email      VARCHAR(100) UNIQUE NOT NULL,
        password   VARCHAR(255) NOT NULL,
        role       VARCHAR(20) NOT NULL CHECK(role IN ('administrador','jalador','servidor','caja')),
        active     BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS products (
        id          SERIAL PRIMARY KEY,
<<<<<<< HEAD
        name        VARCHAR(100) UNIQUE NOT NULL,
=======
        name        VARCHAR(100) NOT NULL,
>>>>>>> dcb9654 (Fix: Use pg driver and DATABASE_URL for Render)
        description TEXT,
        sizes       JSONB NOT NULL,
        active      BOOLEAN DEFAULT true,
        image_url   VARCHAR(255),
        created_at  TIMESTAMP DEFAULT NOW(),
        updated_at  TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS orders (
        id               SERIAL PRIMARY KEY,
        order_number     VARCHAR(20) UNIQUE NOT NULL,
        uuid             VARCHAR(36) UNIQUE NOT NULL,
        status           VARCHAR(20) NOT NULL DEFAULT 'pendiente'
                           CHECK(status IN ('pendiente','preparando','listo','entregado','cancelado')),
        location_type    VARCHAR(20) NOT NULL
                           CHECK(location_type IN ('vehiculo','frente_local','restaurante','botica','otro')),
        location_details JSONB NOT NULL,
        observations     TEXT,
        total            DECIMAL(10,2) NOT NULL,
        created_by       INTEGER NOT NULL,
        updated_by       INTEGER,
        prepared_by      INTEGER,
        delivered_by     INTEGER,
        created_at       TIMESTAMP DEFAULT NOW(),
        updated_at       TIMESTAMP DEFAULT NOW(),
        prepared_at      TIMESTAMP,
        ready_at         TIMESTAMP,
        delivered_at     TIMESTAMP,
        cancelled_at     TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id           SERIAL PRIMARY KEY,
        order_id     INTEGER NOT NULL,
        product_id   INTEGER NOT NULL,
        product_name VARCHAR(100) NOT NULL,
        size         VARCHAR(50) NOT NULL,
        flavors      JSONB DEFAULT '[]',
        quantity     INTEGER NOT NULL CHECK(quantity > 0),
        unit_price   DECIMAL(10,2) NOT NULL,
        subtotal     DECIMAL(10,2) NOT NULL,
        created_at   TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS order_status_history (
        id         SERIAL PRIMARY KEY,
        order_id   INTEGER NOT NULL,
        status     VARCHAR(20) NOT NULL,
        changed_by INTEGER,
        changed_at TIMESTAMP DEFAULT NOW(),
        notes      TEXT
      );

      CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

      CREATE TABLE IF NOT EXISTS payments (
        id             SERIAL PRIMARY KEY,
        order_id       INTEGER NOT NULL,
        method         VARCHAR(20) NOT NULL CHECK(method IN ('efectivo','yape','plin','tarjeta')),
        amount         DECIMAL(10,2) NOT NULL,
        confirmed_by   INTEGER,
        confirmed_at   TIMESTAMP DEFAULT NOW(),
        yape_photo_url TEXT,
        notes          TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);

      CREATE TABLE IF NOT EXISTS flavors (
        id         SERIAL PRIMARY KEY,
        name       TEXT UNIQUE NOT NULL,
        active     BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0
      );
    `);

    console.log('✓ Tablas creadas');
    console.log('✓ Base de datos inicializada');
    process.exit(0);
  } catch (err) {
    console.error('Error inicializando base de datos:', err);
    process.exit(1);
  }
};

run();

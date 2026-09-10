import { initDB } from '../config/database.js';

const run = () => {
  const db = initDB();
  console.log('Creando tablas...');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       VARCHAR(100) NOT NULL,
      email      VARCHAR(100) UNIQUE NOT NULL,
      password   VARCHAR(255) NOT NULL,
      role       VARCHAR(20) NOT NULL CHECK(role IN ('administrador','jalador','servidor','caja')),
      active     INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        VARCHAR(100) NOT NULL,
      description TEXT,
      sizes       TEXT NOT NULL,
      active      INTEGER DEFAULT 1,
      image_url   VARCHAR(255),
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number     VARCHAR(20) UNIQUE NOT NULL,
      uuid             VARCHAR(36) UNIQUE NOT NULL,
      status           VARCHAR(20) NOT NULL DEFAULT 'pendiente'
                         CHECK(status IN ('pendiente','preparando','listo','entregado','cancelado')),
      location_type    VARCHAR(20) NOT NULL
                         CHECK(location_type IN ('vehiculo','frente_local','restaurante','botica','otro')),
      location_details TEXT NOT NULL,
      observations     TEXT,
      total            DECIMAL(10,2) NOT NULL,
      created_by       INTEGER NOT NULL,
      updated_by       INTEGER,
      prepared_by      INTEGER,
      delivered_by     INTEGER,
      created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
      prepared_at      DATETIME,
      ready_at         DATETIME,
      delivered_at     DATETIME,
      cancelled_at     DATETIME
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id     INTEGER NOT NULL,
      product_id   INTEGER NOT NULL,
      product_name VARCHAR(100) NOT NULL,
      size         VARCHAR(50) NOT NULL,
      flavors      TEXT DEFAULT '[]',
      quantity     INTEGER NOT NULL CHECK(quantity > 0),
      unit_price   DECIMAL(10,2) NOT NULL,
      subtotal     DECIMAL(10,2) NOT NULL,
      created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_status_history (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id   INTEGER NOT NULL,
      status     VARCHAR(20) NOT NULL,
      changed_by INTEGER,
      changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      notes      TEXT
    );

    CREATE TABLE IF NOT EXISTS order_number_seq (
      current_value INTEGER DEFAULT 0
    );

    INSERT OR IGNORE INTO order_number_seq (current_value) VALUES (0);

    CREATE TABLE IF NOT EXISTS payments (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id       INTEGER NOT NULL,
      method         VARCHAR(20) NOT NULL CHECK(method IN ('efectivo','yape','plin','tarjeta')),
      amount         DECIMAL(10,2) NOT NULL,
      confirmed_by   INTEGER,
      confirmed_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
      yape_photo_url TEXT,
      notes          TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);

    CREATE TABLE IF NOT EXISTS flavors (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT UNIQUE NOT NULL,
      active     INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0
    );
  `);

  console.log('✓ Tablas creadas');
  console.log('✓ Base de datos inicializada');
  process.exit(0);
};

run().catch((err) => { console.error(err); process.exit(1); });

import { query } from '../config/database.js';
import bcrypt from 'bcryptjs';

class User {
  static async create(data) {
    const hash = await bcrypt.hash(data.password, 10);
    const result = query(
      `INSERT INTO users (name,email,password,role,active)
       VALUES (?,?,?,?,?) RETURNING id,name,email,role,active,created_at`,
      [data.name, data.email, hash, data.role, data.active !== undefined ? data.active : 1]
    );
    return result[0];
  }

  static getAll(filters = {}) {
    let sql = 'SELECT id,name,email,role,active,created_at FROM users WHERE 1=1';
    const params = [];
    if (filters.role) { 
      params.push(filters.role); 
      sql += ` AND role=?`; 
    }    
    if (filters.activeOnly) { 
      sql += ' AND active=1'; 
    }
    sql += ' ORDER BY name ASC';
    const result = query(sql, params);
    return result;
  }

  static getById(id) {
    const result = query('SELECT id,name,email,role,active,created_at FROM users WHERE id=?', [id]);
    return result[0] || null;
  }

  static getByEmail(email) {
    const result = query('SELECT * FROM users WHERE email=?', [email]);
    return result[0] || null;
  }

  static async update(id, data) {
    const sets = [], params = [];
    const add = (col, val) => { params.push(val); sets.push(`${col}=?`); };
    if (data.name     !== undefined) add('name', data.name);
    if (data.email    !== undefined) add('email', data.email);
    if (data.role     !== undefined) add('role', data.role);
    if (data.active   !== undefined) add('active', data.active);
    if (data.password !== undefined) add('password', await bcrypt.hash(data.password, 10));
    if (!sets.length) throw new Error('Nada que actualizar');
    sets.push(`updated_at=datetime('now')`);
    params.push(id);
    const result = query(
      `UPDATE users SET ${sets.join(',')} WHERE id=? RETURNING id,name,email,role,active`,
      params
    );
    return result[0] || null;
  }

  static verifyPassword(plain, hash) { return bcrypt.compare(plain, hash); }

  static deactivate(id) {
    const result = query('UPDATE users SET active=0 WHERE id=? RETURNING id,name,email,role,active', [id]);
    return result[0] || null;
  }

  static activate(id) {
    const result = query('UPDATE users SET active=1 WHERE id=? RETURNING id,name,email,role,active', [id]);
    return result[0] || null;
  }
}

export default User;

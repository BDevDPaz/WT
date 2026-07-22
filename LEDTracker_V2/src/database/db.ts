// src/database/db.ts
import * as SQLite from 'expo-sqlite';
import { AppSettings, WorkSession, AuditLog } from '../types';

let dbInstance: SQLite.SQLiteDatabase | null = null;

// Obtener instancia segura (Singleton)
export const getDB = () => {
  if (!dbInstance) {
    dbInstance = SQLite.openDatabaseSync('worktracker.db');
  }
  return dbInstance;
};

// Inicialización con todas las tablas
export const initDatabase = async () => {
  const db = getDB();
  try {
    // MEJORA: Modo WAL para mejor rendimiento en Android
    await db.execAsync('PRAGMA journal_mode = WAL;');

    // 1. Tabla Settings
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY NOT NULL,
        employee_name TEXT,
        employer_name TEXT NOT NULL,
        company_email TEXT DEFAULT 'bdpaz_developer@outlook.com',
        tolerance_radius INTEGER DEFAULT 50,
        hourly_rate REAL DEFAULT 0,
        language TEXT DEFAULT 'es'
      );
    `);

    // 2. Tabla Sesiones (CRÍTICA: Aseguramos que exista antes de usarla)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS work_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        start_time INTEGER NOT NULL,
        end_time INTEGER,
        status TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        address TEXT,
        location_confirmed INTEGER DEFAULT 0,
        is_manual_edit INTEGER DEFAULT 0,
        manual_note TEXT,
        lunch_taken INTEGER DEFAULT 0,
        date_string TEXT NOT NULL
      );
    `);

    // 3. Tabla Auditoría
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER,
        action_type TEXT,
        details TEXT,
        timestamp INTEGER
      );
    `);

    // 4. Migraciones
    const migrations = [
      "ALTER TABLE settings ADD COLUMN company_email TEXT DEFAULT 'bdpaz_developer@outlook.com';",
      "ALTER TABLE settings ADD COLUMN tolerance_radius INTEGER DEFAULT 50;",
      "ALTER TABLE work_sessions ADD COLUMN lunch_taken INTEGER DEFAULT 0;"
    ];

    for (const query of migrations) {
      try {
        await db.runAsync(query);
      } catch (_) { /* Ignorar si ya existe la columna */ }
    }

    // 5. Insertar configuración por defecto si está vacío
    const check = await db.getFirstAsync('SELECT * FROM settings WHERE id = 1');
    if (!check) {
      await db.runAsync(
        `INSERT INTO settings (id, employer_name, company_email, tolerance_radius, hourly_rate, language)
         VALUES (1, 'LEON''S ELECTRICAL DESIGN', 'bdpaz_developer@outlook.com', 50, 0, 'es')`
      );
    }
    
    console.log("✅ DB Inicializada Correctamente (WAL Mode)");
  } catch (error) {
    console.error("❌ Error FATAL en initDatabase:", error);
    throw error; // Lanzamos el error para detener el arranque en _layout si algo falla
  }
};

// --- Helpers Tipados (Se mantienen igual que antes) ---

export const getSettings = async (): Promise<AppSettings | null> => {
  const db = getDB();
  return await db.getFirstAsync<AppSettings>('SELECT * FROM settings WHERE id = 1');
};

export const insertWorkSession = async (session: WorkSession) => {
  const db = getDB();
  // Aseguramos que date_string no sea nulo
  const date_string = session.date_string || new Date(session.start_time).toISOString().split('T')[0];
  
  return await db.runAsync(
    `INSERT INTO work_sessions (
      start_time, status, latitude, longitude, address,
      location_confirmed, is_manual_edit, manual_note, lunch_taken, date_string
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      session.start_time, session.status, session.latitude, session.longitude, session.address,
      session.location_confirmed, session.is_manual_edit, session.manual_note || '', 
      session.lunch_taken, date_string
    ]
  );
};

export const updateSessionEndTime = async (id: number, end_time: number) => {
  const db = getDB();
  await db.runAsync(
    "UPDATE work_sessions SET end_time = ?, status = 'completed' WHERE id = ?",
    [end_time, id]
  );
};

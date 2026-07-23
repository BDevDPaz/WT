import * as SQLite from 'expo-sqlite';
import { WorkSession, AppSettings, AuditLog } from '../types';

let db: SQLite.SQLiteDatabase;

export const getDB = () => db;

export const initDatabase = async () => {
  try {
    db = await SQLite.openDatabaseAsync('ledtracker_v2.db');

    // Table: work sessions
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS work_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        start_time INTEGER NOT NULL,
        actual_start_time INTEGER,
        end_time INTEGER,
        status TEXT NOT NULL,
        
        latitude REAL,
        longitude REAL,
        
        target_latitude REAL,
        target_longitude REAL,
        setup_latitude REAL,
        setup_longitude REAL,
        
        address TEXT,
        client_name TEXT,
        location_confirmed INTEGER DEFAULT 0,
        is_manual_edit INTEGER DEFAULT 0,
        manual_note TEXT,
        lunch_taken INTEGER DEFAULT 0,
        lunch_start INTEGER,
        lunch_end INTEGER,
        date_string TEXT,
        cached_hourly_rate REAL DEFAULT 0
      );
    `);

    // Table: settings
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY NOT NULL,
        employee_name TEXT,
        employer_name TEXT,
        company_email TEXT,
        tolerance_radius INTEGER DEFAULT 200,
        hourly_rate REAL DEFAULT 0,
        language TEXT DEFAULT 'es',
        start_time TEXT DEFAULT '08:00',
        overtime_multiplier REAL DEFAULT 1.5
      );
    `);

    // Table: audit logs
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER,
        action_type TEXT,
        details TEXT,
        timestamp INTEGER
      );
    `);

    // Auto-Healing: create default settings row on first run to prevent crashes.
    const existingSettings = await db.getFirstAsync("SELECT * FROM settings WHERE id = 1");

    if (!existingSettings) {
      console.log("⚙️ Base de datos nueva: Creando configuración por defecto...");
      await db.runAsync(
        `INSERT INTO settings (id, employee_name, employer_name, company_email, tolerance_radius, hourly_rate, language, start_time, overtime_multiplier)
         VALUES (1, 'Empleado Nuevo', 'LEON''S ELECTRICAL DESIGN', '', 200, 25.0, 'es', '07:00', 1.5)`
      );
    }

    // Migration V3: add cached_hourly_rate if upgrading from an older schema.
    try {
      await db.runAsync('ALTER TABLE work_sessions ADD COLUMN cached_hourly_rate REAL DEFAULT 0');
      console.log('✅ Migración V3 aplicada: cached_hourly_rate agregada.');
    } catch (e) {
      // Column already exists — this is expected on all runs after the first migration.
    }

    console.log("✅ DB Inicializada (V3.0 - Caché Financiero Activo)");
  } catch (error) {
    console.error("❌ Error crítico inicializando la base de datos:", error);
    throw error;
  }
};

// --- INSERTAR SESIÓN ---
export const insertWorkSession = async (session: WorkSession) => {
  try {
    // Snapshot the current hourly rate so historical earnings are correct
    // even if the rate is changed later.
    const settings = await db.getFirstAsync<AppSettings>("SELECT * FROM settings WHERE id = 1");
    const currentRate = settings?.hourly_rate || 0;

    const result = await db.runAsync(
      `INSERT INTO work_sessions (
        start_time, status, 
        latitude, longitude, 
        target_latitude, target_longitude,
        setup_latitude, setup_longitude,
        address, client_name, manual_note, 
        location_confirmed, is_manual_edit, lunch_taken, date_string,
        cached_hourly_rate
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        session.start_time,
        session.status,
        session.latitude || 0,
        session.longitude || 0,
        session.target_latitude || 0,
        session.target_longitude || 0,
        session.setup_latitude || 0,
        session.setup_longitude || 0,
        session.address || '',
        session.client_name || '',
        session.manual_note || '',
        session.location_confirmed || 0,
        session.is_manual_edit || 0,
        session.lunch_taken || 0,
        session.date_string || '',
        currentRate,
      ]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error("Error inserting session:", error);
    throw error;
  }
};

export const updateSessionEndTime = async (id: number, endTime: number) => {
  await db.runAsync("UPDATE work_sessions SET end_time = ?, status = 'completed' WHERE id = ?", [endTime, id]);
};

export const updateSessionLunch = async (id: number, start: number, end: number) => {
  await db.runAsync("UPDATE work_sessions SET lunch_taken = 1, lunch_start = ?, lunch_end = ? WHERE id = ?", [start, end, id]);
};

export const getSettings = async (): Promise<AppSettings | null> => {
  return await db.getFirstAsync<AppSettings>("SELECT * FROM settings WHERE id = 1");
};

export const saveSettings = async (settings: AppSettings) => {
  await db.runAsync(
    `INSERT OR REPLACE INTO settings (id, employee_name, employer_name, company_email, tolerance_radius, hourly_rate, language, start_time, overtime_multiplier)
     VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [settings.employee_name, settings.employer_name, settings.company_email, settings.tolerance_radius, settings.hourly_rate, settings.language, settings.start_time, settings.overtime_multiplier]
  );
};

// --- ELIMINAR Y ACTUALIZAR (Requerido para History) ---
export const deleteWorkSession = async (id: number) => {
  await db.runAsync("UPDATE work_sessions SET status = 'deleted' WHERE id = ?", [id]);
};

export const updateWorkSessionManual = async (id: number, startTime: number, endTime: number | null, note: string) => {
  await db.runAsync(
    "UPDATE work_sessions SET start_time = ?, end_time = ?, manual_note = ?, is_manual_edit = 1 WHERE id = ?",
    [startTime, endTime, note, id]
  );
};

export const checkSessionOverlap = async (start: number, end: number, excludeId: number): Promise<boolean> => {
  try {
    // Treat an active session (end = 0 or null) as extending to a far-future timestamp.
    const checkEnd = (!end || end === 0) ? 9999999999999 : end;

    const result = await db.getFirstAsync<{ count: number }>(`
      SELECT COUNT(*) as count
      FROM work_sessions
      WHERE id != ?
        AND status != 'deleted'
        AND start_time < ?
        AND (CASE WHEN end_time IS NULL OR end_time = 0 THEN 9999999999999 ELSE end_time END) > ?
    `, [excludeId, checkEnd, start]);

    return (result?.count || 0) > 0;
  } catch (e) {
    console.error("Error checking session overlap:", e);
    return false;
  }
};

export const insertAuditLog = async (sessionId: number, action: string, details: string) => {
  await db.runAsync("INSERT INTO audit_logs (session_id, action_type, details, timestamp) VALUES (?, ?, ?, ?)", [sessionId, action, details, Date.now()]);
};

export const getAllAsync = async <T>(query: string, params: any[] = []): Promise<T[]> => { return await db.getAllAsync(query, params); };
export const getFirstAsync = async <T>(query: string, params: any[] = []): Promise<T | null> => { return await db.getFirstAsync(query, params); };

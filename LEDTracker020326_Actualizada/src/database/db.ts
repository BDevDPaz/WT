import * as SQLite from 'expo-sqlite';
import { WorkSession, AppSettings } from '../types';

let db: SQLite.SQLiteDatabase;

// --- GETTER Y SETUP ---
export const getDB = () => db;

export const initDatabase = async () => {
  try {
    db = await SQLite.openDatabaseAsync('ledtracker_v2.db');

    // 1. Tabla Sesiones
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
        date_string TEXT
      );
    `);

    // 2. Tabla Settings
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

    // ✅ Auto-Healing: Insertar Configuración por Defecto si no existe
    const existingSettings = await db.getFirstAsync("SELECT * FROM settings WHERE id = 1");

    if (!existingSettings) {
      console.log("⚙️ Base de datos nueva: Creando configuración por defecto...");
      // Nota: Escapamos 'LEON'S' como 'LEON''S' para SQL
      await db.runAsync(
        `INSERT INTO settings (id, employee_name, employer_name, company_email, tolerance_radius, hourly_rate, language, start_time, overtime_multiplier)
         VALUES (1, 'Empleado Nuevo', 'LEON''S ELECTRICAL DESIGN', '', 200, 25.0, 'es', '07:00', 1.5)`
      );
    }

    console.log("✅ DB Inicializada (V2.1 - Settings Verificado)");
  } catch (error) {
    console.error("❌ Error inicializando la base de datos:", error);
  }
};

// --- OPERACIONES DE SESIÓN ---

export const insertWorkSession = async (session: WorkSession) => {
  try {
    const result = await db.runAsync(
      `INSERT INTO work_sessions (
        start_time, status,
        latitude, longitude,
        target_latitude, target_longitude,
        setup_latitude, setup_longitude,
        address, client_name, manual_note,
        location_confirmed, is_manual_edit, lunch_taken, date_string
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        session.start_time,
        session.status,
        session.latitude,
        session.longitude,
        session.target_latitude || 0,
        session.target_longitude || 0,
        session.setup_latitude || 0,
        session.setup_longitude || 0,
        session.address,
        session.client_name || '',
        session.manual_note || '',
        session.location_confirmed,
        session.is_manual_edit,
        session.lunch_taken,
        session.date_string
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

// --- OPERACIONES DE SETTINGS ---

export const getSettings = async (): Promise<AppSettings | null> => {
  return await db.getFirstAsync<AppSettings>("SELECT * FROM settings WHERE id = 1");
};

export const saveSettings = async (settings: AppSettings) => {
  await db.runAsync(
    `INSERT OR REPLACE INTO settings (id, employee_name, employer_name, company_email, tolerance_radius, hourly_rate, language, start_time, overtime_multiplier)
     VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      settings.employee_name,
      settings.employer_name,
      settings.company_email,
      settings.tolerance_radius,
      settings.hourly_rate,
      settings.language,
      settings.start_time,
      settings.overtime_multiplier
    ]
  );
};

// --- GESTIÓN DE HISTORIAL (Eliminar, Editar, Validar) ---

export const deleteWorkSession = async (id: number) => {
  await db.runAsync("UPDATE work_sessions SET status = 'deleted' WHERE id = ?", [id]);
};

export const updateWorkSessionManual = async (id: number, startTime: number, endTime: number | null, note: string) => {
  // Actualiza tiempos y marca como edición manual.
  await db.runAsync(
    "UPDATE work_sessions SET start_time = ?, end_time = ?, manual_note = ?, is_manual_edit = 1 WHERE id = ?",
    [startTime, endTime, note, id]
  );
};

// ✅ VALIDACIÓN DE SUPERPOSICIÓN (CRÍTICO)
export const checkSessionOverlap = async (start: number, end: number, excludeId: number): Promise<boolean> => {
  try {
    // Si end es 0 o null (sesión activa que se quiere crear/editar), usamos un futuro lejano para validar
    const checkEnd = (!end || end === 0) ? 9999999999999 : end;

    // Consulta SQL: Busca si existe algún registro que NO sea el actual (excludeId)
    // y que NO esté borrado, donde los intervalos de tiempo se solapen.
    // Lógica de solape: (StartA < EndB) AND (EndA > StartB)
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
    console.error("Error checking overlap:", e);
    return false; // Fail-open para no bloquear la app en caso de error SQL raro
  }
};

// --- AUDITORÍA Y UTILIDADES ---

export const insertAuditLog = async (sessionId: number, action: string, details: string) => {
  await db.runAsync(
    "INSERT INTO audit_logs (session_id, action_type, details, timestamp) VALUES (?, ?, ?, ?)", 
    [sessionId, action, details, Date.now()]
  );
};

// Wrappers genéricos para flexibilidad
export const getAllAsync = async <T>(query: string, params: any[] = []): Promise<T[]> => { 
  return await db.getAllAsync(query, params); 
};

export const getFirstAsync = async <T>(query: string, params: any[] = []): Promise<T | null> => { 
  return await db.getFirstAsync(query, params); 
};

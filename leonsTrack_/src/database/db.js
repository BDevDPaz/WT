import * as SQLite from 'expo-sqlite';

let db = null;

export const getDB = () => {
  if (!db) {
    db = SQLite.openDatabaseSync('worktracker.db');
  }
  return db;
};

export const initDB = async () => {
  const database = getDB();
  
  try {
    // 1. Settings
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY NOT NULL,
        employee_name TEXT,
        employer_name TEXT,
        hourly_rate REAL DEFAULT 0,
        language TEXT DEFAULT 'es'
      );
    `);

    // 2. Work Sessions (AGREGADO: date_string)
    // Es vital para filtrar los trabajos "de hoy".
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS work_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        start_time INTEGER,
        end_time INTEGER,
        latitude REAL,
        longitude REAL,
        address TEXT,
        status TEXT, 
        is_manual_edit INTEGER DEFAULT 0, 
        manual_note TEXT,
        lunch_taken INTEGER DEFAULT 0,
        date_string TEXT
      );
    `);

    // 3. Audit Logs
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER,
        action_type TEXT,
        details TEXT,
        timestamp INTEGER
      );
    `);

    // 4. MIGRACIÓN DE EMERGENCIA
    // Aseguramos que existan las columnas críticas si la DB es vieja
    const migrations = [
      "ALTER TABLE work_sessions ADD COLUMN is_manual_edit INTEGER DEFAULT 0;",
      "ALTER TABLE work_sessions ADD COLUMN manual_note TEXT;",
      "ALTER TABLE work_sessions ADD COLUMN lunch_taken INTEGER DEFAULT 0;",
      "ALTER TABLE work_sessions ADD COLUMN status TEXT;",
      "ALTER TABLE work_sessions ADD COLUMN date_string TEXT;", // <--- CRÍTICO
      "ALTER TABLE settings ADD COLUMN language TEXT DEFAULT 'es';"
    ];

    for (const query of migrations) {
      try {
        await database.runAsync(query);
      } catch (e) {
        // Ignorar si ya existe
      }
    }

    // 5. Datos por defecto
    const result = await database.getFirstAsync("SELECT * FROM settings");
    if (!result) {
      await database.runAsync("INSERT INTO settings (id, hourly_rate, language) VALUES (1, 0, 'es')");
    }

    console.log("DB Inicializada y corregida.");

  } catch (error) {
    console.error("Error DB:", error);
  }
};

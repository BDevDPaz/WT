// Diccionario de textos (Español / Inglés)
// Centraliza todos los textos de la UI y del Reporte PDF

export const translations = {
  es: {
    // --- UI GLOBAL (Botones comunes) ---
    btn_cancel: "Cancelar",
    btn_save: "Guardar",

    // --- PANTALLA PRINCIPAL (Home) ---
    header_title: "WorkTracker",
    status_active: "🟢 TRABAJANDO EN:",
    status_inactive: "🔴 FUERA DE SERVICIO",
    no_activity: "No hay actividad registrada ahora.",
    btn_clock_out: "MARCAR SALIDA MANUAL",
    stats_hours: "Horas Hoy",
    stats_earnings: "Ganancia Est.",
    btn_new_job: "📍 NUEVO TRABAJO",
    btn_pdf: "📄 GENERAR REPORTE PDF",
    footer_text: "GPS Auto-Stop • Tarifa:",

    // --- MODAL: DAILY SETUP (Inicio Jornada) ---
    daily_title: "Configuración Diaria",
    daily_label: "¿Dónde trabajarás hoy?",
    daily_placeholder: "Ej: 5601 Balboa Blvd...",
    daily_btn_start: "Iniciar Jornada",

    // --- MODAL: SETTINGS (Configuración) ---
    settings_title: "⚙️ Configuración",
    label_name: "Tu Nombre:",
    label_company: "Nombre Empresa/Cliente:",
    label_rate: "Tarifa por Hora ($):",
    label_lang: "Idioma / Language:",

    // --- MODAL: LUNCH (Almuerzo) ---
    lunch_title: "Hora de Almuerzo",
    lunch_msg: "¿Vas a tomar tu descanso hoy?",
    lunch_sub: "(Se descontará 1 hora del total)",
    lunch_yes: "SÍ, DESCONTAR",
    lunch_no: "NO",
    
    // --- REPORTE PDF: GENERAL ---
    pdf_title: "REPORTE DE HORAS",
    pdf_subtitle: "Sistema Anti-Fraude Activo - WorkTracker",
    pdf_employee: "Empleado:",
    pdf_date: "Fecha Reporte:",
    pdf_company: "Cliente/Empresa:",
    pdf_rate: "Tarifa Base:",
    pdf_total_reg: "Horas Regulares:",
    pdf_total_ot: "Horas Overtime (1.5x):",
    pdf_pay_total: "PAGO TOTAL APROBADO:",
    
    // --- REPORTE PDF: COLUMNAS ---
    col_date: "Fecha",
    col_loc: "Ubicación",
    col_in: "Entrada",
    col_out: "Salida",
    col_reg: "Reg",
    col_ot: "OT",
    col_status: "Estado (Integridad)",
    
    // --- REPORTE PDF: ESTADOS (Semáforo) ---
    status_ok: "✅ Íntegro/Auto",
    status_del: "⛔ ELIMINADO",
    status_edit: "⚠️ Manipulado",
    status_lunch: " 🍔(-1h)",
    
    // --- REPORTE PDF: AUDITORÍA ---
    audit_title: "📢 Auditoría de Integridad de Datos",
    audit_intro: "A continuación se detallan las modificaciones o eliminaciones realizadas manualmente sobre los registros originales del GPS:",
    audit_empty: "No se registraron manipulaciones ni eliminaciones esta semana.",
    audit_modified: "MODIFICADO",
    audit_deleted: "ELIMINADO",
    audit_lunch: "ALMUERZO"
  },
  en: {
    // --- UI GLOBAL ---
    btn_cancel: "Cancel",
    btn_save: "Save",

    // --- HOME SCREEN ---
    header_title: "WorkTracker",
    status_active: "🟢 WORKING AT:",
    status_inactive: "🔴 OFF DUTY",
    no_activity: "No active session recorded.",
    btn_clock_out: "MANUAL CLOCK OUT",
    stats_hours: "Hours Today",
    stats_earnings: "Est. Earnings",
    btn_new_job: "📍 NEW JOB",
    btn_pdf: "📄 GENERATE PDF REPORT",
    footer_text: "GPS Auto-Stop • Rate:",

    // --- DAILY SETUP MODAL ---
    daily_title: "Daily Setup",
    daily_label: "Where are you working today?",
    daily_placeholder: "Ex: 5601 Balboa Blvd...",
    daily_btn_start: "Start Work",

    // --- SETTINGS MODAL ---
    settings_title: "⚙️ Settings",
    label_name: "Your Name:",
    label_company: "Client/Company Name:",
    label_rate: "Hourly Rate ($):",
    label_lang: "Language / Idioma:",

    // --- LUNCH MODAL ---
    lunch_title: "Lunch Break",
    lunch_msg: "Are you taking your break today?",
    lunch_sub: "(1 hour will be deducted)",
    lunch_yes: "YES, DEDUCT",
    lunch_no: "NO",
    
    // --- PDF REPORT: GENERAL ---
    pdf_title: "HOURS REPORT",
    pdf_subtitle: "Anti-Fraud System Active - WorkTracker",
    pdf_employee: "Employee:",
    pdf_date: "Report Date:",
    pdf_company: "Client/Company:",
    pdf_rate: "Base Rate:",
    pdf_total_reg: "Regular Hours:",
    pdf_total_ot: "Overtime Hours (1.5x):",
    pdf_pay_total: "TOTAL APPROVED PAY:",
    
    // --- PDF REPORT: COLUMNS ---
    col_date: "Date",
    col_loc: "Location",
    col_in: "Time In",
    col_out: "Time Out",
    col_reg: "Reg",
    col_ot: "OT",
    col_status: "Status (Integrity)",
    
    // --- PDF REPORT: STATUS ---
    status_ok: "✅ Auto/Verified",
    status_del: "⛔ DELETED",
    status_edit: "⚠️ Manipulated",
    status_lunch: " 🍔(-1h)",
    
    // --- PDF REPORT: AUDIT ---
    audit_title: "📢 Data Integrity Audit Log",
    audit_intro: "Below are manual modifications or deletions performed on the original GPS records:",
    audit_empty: "No manipulations or deletions recorded this week.",
    audit_modified: "MODIFIED",
    audit_deleted: "DELETED",
    audit_lunch: "LUNCH"
  }
};

// Helper para obtener el diccionario seguro
export const getTexts = (langCode) => {
  return translations[langCode] || translations['es'];
};

// src/utils/i18n.ts

export const translations = {
  es: {
    // Global UI
    btn_cancel: "Cancelar",
    btn_save: "Guardar",
    btn_edit: "Editar",
    btn_delete: "Eliminar",
    btn_close: "Cerrar",
    
    // Header & Home
    header_title: "WorkTracker",
    status_active: "🟢 TRABAJANDO EN:",
    status_inactive: "🔴 FUERA DE SERVICIO",
    no_activity: "No hay actividad registrada.",
    btn_clock_out: "MARCAR SALIDA",
    stats_hours: "Horas Hoy",
    stats_earnings: "Ganancia Est.",
    btn_new_job: "📍 NUEVO TRABAJO",
    
    // Daily Setup Modal
    daily_title: "Configuración Diaria",
    daily_label: "¿Dónde trabajarás hoy?",
    daily_placeholder: "Ej: 5601 Balboa Blvd...",
    daily_btn_start: "Iniciar Jornada",

    // History & PDF
    history_title: "Historial",
    btn_pdf: "📄 PDF",
    pdf_title: "REPORTE DE HORAS",
    pdf_employee: "Empleado",
    col_date: "Fecha",
    col_loc: "Ubicación",
    col_in: "Entrada",
    col_out: "Salida",
    
    // Settings & Admin
    settings_title: "Configuración",
    label_lang: "Idioma / Language",
    label_name: "Nombre Empleado",
    label_rate: "Tarifa por Hora ($)",
    
    // Admin Zone
    admin_zone: "🔒 ZONA ADMIN",
    admin_unlock: "Desbloquear",
    admin_pass_placeholder: "Contraseña Admin",
    admin_locked_msg: "Configuración de empresa bloqueada.",
    label_company_name: "Nombre Empresa",
    label_report_email: "Email Reportes",
    label_radius: "Radio Tolerancia (mts)",
    
    // Errors / Alerts / Logs
    err_pass_wrong: "Contraseña incorrecta",
    err_out_of_range: "Fuera de Rango",
    msg_out_of_range: "Estás muy lejos del sitio.",
    log_auto_exit: "Salida Automática por distancia",
    log_auto_entry: "Entrada Automática"
  },
  en: {
    // Global UI
    btn_cancel: "Cancel",
    btn_save: "Save",
    btn_edit: "Edit",
    btn_delete: "Delete",
    btn_close: "Close",
    
    // Header & Home
    header_title: "WorkTracker",
    status_active: "🟢 WORKING AT:",
    status_inactive: "🔴 OFF DUTY",
    no_activity: "No active session.",
    btn_clock_out: "CLOCK OUT",
    stats_hours: "Hours Today",
    stats_earnings: "Est. Earnings",
    btn_new_job: "📍 NEW JOB",
    
    // Daily Setup Modal
    daily_title: "Daily Setup",
    daily_label: "Where are you working today?",
    daily_placeholder: "Ex: 5601 Balboa Blvd...",
    daily_btn_start: "Start Work",

    // History & PDF
    history_title: "History",
    btn_pdf: "📄 PDF",
    pdf_title: "HOURS REPORT",
    pdf_employee: "Employee",
    col_date: "Date",
    col_loc: "Location",
    col_in: "In",
    col_out: "Out",
    
    // Settings & Admin
    settings_title: "Settings",
    label_lang: "Language / Idioma",
    label_name: "Employee Name",
    label_rate: "Hourly Rate ($)",
    
    // Admin Zone
    admin_zone: "🔒 ADMIN ZONE",
    admin_unlock: "Unlock",
    admin_pass_placeholder: "Admin Password",
    admin_locked_msg: "Company settings locked.",
    label_company_name: "Company Name",
    label_report_email: "Report Email",
    label_radius: "Tolerance Radius (m)",
    
    // Errors / Alerts / Logs
    err_pass_wrong: "Incorrect password",
    err_out_of_range: "Out of Range",
    msg_out_of_range: "You are too far from the site.",
    log_auto_exit: "Auto-Checkout by distance",
    log_auto_entry: "Auto Check-in"
  }
};

import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { initDB, getDB } from '../src/database/db';
import { setupNotifications, scheduleDailyMorningCheck } from '../src/services/Notifications'; 
import DailySetupModal from '../src/components/DailySetupModal';
import SettingsModal from '../src/components/SettingsModal';
import HistoryModal from '../src/components/HistoryModal'; 
import LunchModal from '../src/components/LunchModal';
import { generateWeeklyReport } from '../src/services/ReportGenerator';
import { getTexts } from '../src/utils/i18n'; 

export default function HomeScreen() {
  // --- ESTADOS DE MODALES ---
  const [modalVisible, setModalVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [lunchVisible, setLunchVisible] = useState(false);
  
  // --- ESTADOS DE DATOS ---
  const [activeSession, setActiveSession] = useState(null);
  const [todayStats, setTodayStats] = useState({ hours: 0, earnings: 0 });
  const [config, setConfig] = useState({ rate: 0 });
  const [currentLang, setCurrentLang] = useState('es');

  // --- INICIALIZACIÓN ---
  useEffect(() => {
    const setup = async () => {
      await initDB();
      await setupNotifications();
      await scheduleDailyMorningCheck();
      refreshData();
    };
    setup();
  }, []);

  // --- FUNCIÓN CENTRAL DE REFRESCO ---
  const refreshData = async () => {
    const db = getDB();
    if (!db) return;

    // 1. CARGAR CONFIGURACIÓN
    let loadedSettings = null;
    try {
      loadedSettings = await db.getFirstAsync("SELECT * FROM settings WHERE id = 1");
      if (loadedSettings) {
        setConfig({ rate: loadedSettings.hourly_rate || 0 });
        setCurrentLang(loadedSettings.language || 'es'); 
      }
    } catch (e) {
      console.log("Error loading settings", e);
    }

    // 2. CARGAR SESIÓN ACTIVA
    try {
      const session = await db.getFirstAsync(
        "SELECT * FROM work_sessions WHERE status = 'active' ORDER BY id DESC LIMIT 1"
      );
      setActiveSession(session);
    } catch (e) {
      console.log("Error loading active session", e);
    }

    // 3. CALCULAR ESTADÍSTICAS DE HOY
    try {
      const today = new Date().toISOString().split('T')[0];
      const sessions = await db.getAllAsync(
        "SELECT * FROM work_sessions WHERE date_string = ?", 
        [today]
      );

      let totalMs = 0;
      sessions.forEach(s => {
        const end = s.end_time || Date.now();
        let duration = (end - s.start_time);

        // Descuento de almuerzo (-1 hora)
        if (s.lunch_taken === 1) {
          duration = duration - 3600000;
        }
        
        if (duration < 0) duration = 0;

        // Solo sumar si no está borrado (Soft Delete)
        if (s.status !== 'deleted') {
          totalMs += duration;
        }
      });
      
      const hours = (totalMs / (1000 * 60 * 60));
      const rate = loadedSettings?.hourly_rate || config.rate || 0;

      setTodayStats({
        hours: hours.toFixed(2),
        earnings: (hours * rate).toFixed(2)
      });

    } catch (e) {
      console.log("Error calculating stats", e);
    }
  };

  // --- MANEJADORES ---
  const handleClockOut = async () => {
    if (!activeSession) return;
    
    const t = getTexts(currentLang);
    const db = getDB();
    const endTime = Date.now();
    
    await db.runAsync(
      "UPDATE work_sessions SET end_time = ?, status = 'completed' WHERE id = ?",
      [endTime, activeSession.id]
    );
    
    refreshData();
    Alert.alert("WorkTracker", t.header_title + ": OK"); 
  };

  const t = getTexts(currentLang); 

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerRow}>
        <Text style={styles.header}>{t.header_title}</Text>
        <View style={{flexDirection: 'row', gap: 15}}>
          <TouchableOpacity onPress={() => setHistoryVisible(true)} style={styles.iconBtn}>
            <Text style={{fontSize: 24}}>📅</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSettingsVisible(true)} style={styles.iconBtn}>
            <Text style={{fontSize: 24}}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* TARJETA DE ESTADO */}
      <View style={[styles.card, activeSession ? styles.cardActive : styles.cardInactive]}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
            <Text style={styles.cardTitle}>
              {activeSession ? t.status_active : t.status_inactive}
            </Text>
            
            {/* BOTÓN ALMUERZO: Solo si hay sesión activa y NO se ha tomado lunch aún */}
            {activeSession && activeSession.lunch_taken === 0 && (
                <TouchableOpacity onPress={() => setLunchVisible(true)} style={{padding: 5}}>
                    <Text style={{fontSize: 22}}>🍔</Text>
                </TouchableOpacity>
            )}
            {/* INDICADOR SI YA SE TOMÓ */}
            {activeSession && activeSession.lunch_taken === 1 && (
                <Text style={{fontSize: 12, color: '#AAA', fontWeight:'bold'}}>Lunch -1h ✅</Text>
            )}
        </View>

        {activeSession ? (
          <>
            <Text style={styles.locationText}>{activeSession.address}</Text>
            <Text style={styles.timeText}>
              In: {new Date(activeSession.start_time).toLocaleTimeString()}
            </Text>
            <TouchableOpacity style={styles.stopBtn} onPress={handleClockOut}>
              <Text style={styles.stopBtnText}>{t.btn_clock_out}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.placeholderText}>{t.no_activity}</Text>
        )}
      </View>

      {/* RESUMEN DE HOY */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>{t.stats_hours}</Text>
          <Text style={styles.statValue}>{todayStats.hours}h</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>{t.stats_earnings}</Text>
          <Text style={styles.statValue}>${todayStats.earnings}</Text>
        </View>
      </View>

      {/* BOTÓN NUEVO TRABAJO */}
      {!activeSession && (
        <TouchableOpacity style={styles.mainBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.mainBtnText}>{t.btn_new_job}</Text>
        </TouchableOpacity>
      )}

      {/* BOTÓN PDF */}
      <TouchableOpacity style={styles.pdfBtn} onPress={generateWeeklyReport}>
        <Text style={styles.pdfBtnText}>{t.btn_pdf}</Text>
      </TouchableOpacity>

      {/* FOOTER */}
      {/* Usamos marginTop: auto para empujarlo al fondo */}
      <View style={{marginTop: 'auto', alignItems: 'center'}}>
        <Text style={styles.footer}>{t.footer_text} ${config.rate}/hr</Text>
      </View>

      {/* --- MODALES --- */}
      <DailySetupModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onJobStarted={refreshData}
      />

      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        onSave={refreshData}
      />

      <HistoryModal
        visible={historyVisible}
        onClose={() => setHistoryVisible(false)}
        onUpdate={refreshData}
      />
      
      <LunchModal 
        visible={lunchVisible} 
        onClose={() => setLunchVisible(false)} 
        session={activeSession}
        onUpdate={refreshData}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // Padding Bottom 50 para evitar la barra de navegación de Android
  container: { flex: 1, backgroundColor: '#000', padding: 20, paddingTop: 50, paddingBottom: 50 },
  
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  header: { fontSize: 28, color: '#FFF', fontWeight: 'bold' },
  iconBtn: { padding: 5 },

  card: { padding: 20, borderRadius: 15, marginBottom: 20 },
  cardActive: { backgroundColor: '#1C2C1E', borderWidth: 1, borderColor: '#4CAF50' },
  cardInactive: { backgroundColor: '#2C1C1C', borderWidth: 1, borderColor: '#F44336' },
  cardTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  locationText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  timeText: { color: '#AAA', fontSize: 14, marginBottom: 15 },
  placeholderText: { color: '#AAA', fontStyle: 'italic' },

  stopBtn: { backgroundColor: '#D32F2F', padding: 10, borderRadius: 8, alignItems: 'center' },
  stopBtnText: { color: '#FFF', fontWeight: 'bold' },

  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statBox: { backgroundColor: '#1E1E1E', width: '48%', padding: 15, borderRadius: 10, alignItems: 'center' },
  statLabel: { color: '#888', fontSize: 14 },
  statValue: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },

  mainBtn: { backgroundColor: '#007AFF', padding: 18, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  mainBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },

  pdfBtn: { backgroundColor: '#FFD700', padding: 15, borderRadius: 12, alignItems: 'center' },
  pdfBtnText: { color: '#000', fontSize: 16, fontWeight: 'bold' },

  footer: { color: '#444', textAlign: 'center', fontSize: 12, marginTop: 10 }
});

import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getDB } from '../database/db';
import { getTexts } from '../utils/i18n';

export default function LunchModal({ visible, onClose, session, onUpdate }) {
  const [language, setLanguage] = useState('es');

  // Cargar idioma preferido al abrir el modal
  useEffect(() => {
    if (visible) {
      const loadLang = async () => {
        try {
          const db = getDB();
          const settings = await db.getFirstAsync("SELECT language FROM settings WHERE id = 1");
          if (settings?.language) setLanguage(settings.language);
        } catch (e) {
          console.log("Error loading language", e);
        }
      };
      loadLang();
    }
  }, [visible]);

  // Si no hay sesión activa, no mostramos nada
  if (!session) return null;

  // Obtener diccionario de textos
  const t = getTexts(language);

  const handleLunch = async (taken) => {
    try {
      const db = getDB();
      // 1 = Tomó almuerzo (descontar hora), 0 = No tomó
      const value = taken ? 1 : 0;
      
      // 1. Actualizar la sesión actual
      await db.runAsync(
        "UPDATE work_sessions SET lunch_taken = ? WHERE id = ?",
        [value, session.id]
      );

      // 2. Registrar en Auditoría (Solo si tomó almuerzo)
      if (taken) {
        const logMsg = language === 'en' 
          ? 'User confirmed 1h lunch deduction.' 
          : 'Usuario confirmó descuento de 1 hora de almuerzo.';
          
        await db.runAsync(
          "INSERT INTO audit_logs (session_id, action_type, details, timestamp) VALUES (?, ?, ?, ?)",
          [session.id, 'ALMUERZO', logMsg, Date.now()]
        );
      }

      // Feedback al usuario
      if (taken) {
        Alert.alert("WorkTracker", t.lunch_sub); // "Se descontará 1 hora..."
      }

      onUpdate(); // Recargar datos en la pantalla principal
      onClose();  // Cerrar modal
    } catch (e) {
      console.error(e);
      Alert.alert("Error", language === 'en' ? "Could not save." : "No se pudo guardar.");
    }
  };

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={() => {}}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.emoji}>🍔</Text>
          <Text style={styles.title}>{t.lunch_title}</Text>
          <Text style={styles.msg}>{t.lunch_msg}</Text>
          <Text style={styles.subMsg}>{t.lunch_sub}</Text>

          <View style={styles.btnRow}>
            {/* Botón NO */}
            <TouchableOpacity style={styles.noBtn} onPress={() => handleLunch(false)}>
              <Text style={styles.btnText}>{t.lunch_no}</Text>
            </TouchableOpacity>
            
            {/* Botón SÍ */}
            <TouchableOpacity style={styles.yesBtn} onPress={() => handleLunch(true)}>
              <Text style={styles.btnText}>{t.lunch_yes}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalView: { 
    margin: 20, 
    backgroundColor: '#222', 
    borderRadius: 20, 
    padding: 25, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#444',
    elevation: 5 
  },
  emoji: { fontSize: 40, marginBottom: 10 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#FFF', marginBottom: 10 },
  msg: { color: '#DDD', fontSize: 16, textAlign: 'center' },
  subMsg: { color: '#AAA', fontSize: 12, marginBottom: 20, fontStyle: 'italic' },
  
  btnRow: { flexDirection: 'row', gap: 15, width: '100%' },
  
  noBtn: { 
    flex: 1, 
    padding: 15, 
    backgroundColor: '#3A1515', 
    borderRadius: 10, 
    alignItems: 'center' 
  },
  yesBtn: { 
    flex: 1, 
    padding: 15, 
    backgroundColor: '#1C2C1E', 
    borderRadius: 10, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#4CAF50' 
  },
  
  btnText: { color: '#FFF', fontWeight: 'bold' }
});

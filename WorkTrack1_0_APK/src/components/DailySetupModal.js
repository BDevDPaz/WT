import React, { useState, useEffect } from 'react';
import { 
  Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert 
} from 'react-native';
import { getDB } from '../database/db';
import { getTexts } from '../utils/i18n';

export default function DailySetupModal({ visible, onClose, onJobStarted }) {
  const [address, setAddress] = useState('');
  const [language, setLanguage] = useState('es');

  useEffect(() => {
    if (visible) {
      const loadLang = async () => {
        try {
          const db = getDB();
          const settings = await db.getFirstAsync("SELECT language FROM settings WHERE id = 1");
          if (settings?.language) setLanguage(settings.language);
        } catch (e) {
          console.log(e);
        }
      };
      loadLang();
    }
  }, [visible]);

  const handleStart = async () => {
    if (!address.trim()) {
      Alert.alert("Error", language === 'en' ? "Enter an address" : "Ingresa una dirección");
      return;
    }

    try {
      const db = getDB();
      const startTime = Date.now();
      
      // GENERAR DATE_STRING (YYYY-MM-DD)
      // Esto soluciona el error "NOT NULL constraint failed"
      const dateString = new Date().toISOString().split('T')[0];

      await db.runAsync(
        "INSERT INTO work_sessions (start_time, address, status, lunch_taken, date_string) VALUES (?, ?, 'active', 0, ?)",
        [startTime, address, dateString]
      );
      
      onJobStarted();
      setAddress('');
      onClose();
    } catch (e) {
      console.error("Error al crear proyecto:", e);
      Alert.alert("Error", "No se pudo crear el proyecto. Revisa la consola.");
    }
  };

  const t = getTexts(language);

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.emoji}>📍</Text>
          <Text style={styles.title}>{t.daily_title}</Text>
          
          <Text style={styles.label}>{t.daily_label}</Text>
          
          <View style={styles.inputContainer}>
            <Text style={{fontSize: 20, marginRight: 10}}>🔎</Text>
            <TextInput 
              style={styles.input} 
              value={address} 
              onChangeText={setAddress} 
              placeholder={t.daily_placeholder}
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.btnText}>{t.btn_cancel}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
              <Text style={styles.btnText}>{t.daily_btn_start}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.8)' },
  modalView: { margin: 20, backgroundColor: '#1E1E1E', borderRadius: 15, padding: 25, alignItems: 'center' },
  emoji: { fontSize: 40, marginBottom: 10 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#FFF', marginBottom: 20, textAlign: 'center' },
  label: { color: '#AAA', marginBottom: 10, alignSelf: 'flex-start' },
  
  inputContainer: { 
    flexDirection: 'row', 
    backgroundColor: '#333', 
    borderRadius: 8, 
    alignItems: 'center', 
    paddingHorizontal: 10,
    marginBottom: 20,
    width: '100%'
  },
  input: { flex: 1, color: '#FFF', paddingVertical: 12, fontSize: 16 },

  btnRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', gap: 10 },
  cancelBtn: { padding: 15, backgroundColor: '#333', borderRadius: 8, flex: 1, alignItems: 'center' },
  startBtn: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, flex: 1, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold' }
});

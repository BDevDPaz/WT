import React, { useState, useEffect } from 'react';
import { 
  Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert 
} from 'react-native';
import { getDB } from '../database/db';
import { getTexts } from '../utils/i18n'; 

export default function SettingsModal({ visible, onClose, onSave }) {
  const [employee, setEmployee] = useState('');
  const [employer, setEmployer] = useState('');
  const [rate, setRate] = useState('');
  const [language, setLanguage] = useState('es'); // Idioma por defecto

  // Cargar datos guardados al abrir
  useEffect(() => {
    if (visible) loadSettings();
  }, [visible]);

  const loadSettings = async () => {
    try {
      const db = getDB();
      const settings = await db.getFirstAsync("SELECT * FROM settings WHERE id = 1");
      if (settings) {
        setEmployee(settings.employee_name || '');
        setEmployer(settings.employer_name || '');
        setRate(settings.hourly_rate ? settings.hourly_rate.toString() : '');
        setLanguage(settings.language || 'es');
      }
    } catch (e) {
      console.error("Error loading settings:", e);
    }
  };

  const handleSave = async () => {
    try {
      const db = getDB();
      // Guardamos perfil, tarifa e idioma seleccionado
      await db.runAsync(
        `UPDATE settings SET employee_name = ?, employer_name = ?, hourly_rate = ?, language = ? WHERE id = 1`,
        [employee, employer, parseFloat(rate) || 0, language]
      );
      
      const t = getTexts(language); // Obtener textos para el mensaje de éxito
      Alert.alert("WorkTracker", t.btn_save + " OK!"); 
      
      onSave(); // Recargar datos en la pantalla principal
      onClose();
    } catch (e) {
      Alert.alert("Error", "No se pudo guardar.");
    }
  };

  // Obtener diccionario actual basado en el estado 'language' (Actualización inmediata)
  const t = getTexts(language);

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.title}>{t.settings_title}</Text>

          {/* Nombre Empleado */}
          <Text style={styles.label}>{t.label_name}</Text>
          <TextInput 
            style={styles.input} 
            value={employee} 
            onChangeText={setEmployee} 
            placeholder="..." 
            placeholderTextColor="#666"
          />

          {/* Nombre Empresa */}
          <Text style={styles.label}>{t.label_company}</Text>
          <TextInput 
            style={styles.input} 
            value={employer} 
            onChangeText={setEmployer} 
            placeholder="..." 
            placeholderTextColor="#666"
          />

          {/* Tarifa */}
          <Text style={styles.label}>{t.label_rate}</Text>
          <TextInput 
            style={styles.input} 
            value={rate} 
            onChangeText={setRate} 
            keyboardType="numeric" 
            placeholder="0.00" 
            placeholderTextColor="#666"
          />

          {/* SELECTOR DE IDIOMA */}
          <Text style={styles.label}>{t.label_lang}</Text>
          <View style={styles.langRow}>
            <TouchableOpacity 
              style={[styles.langBtn, language === 'es' && styles.langBtnActive]} 
              onPress={() => setLanguage('es')}
            >
              <Text style={[styles.langText, language === 'es' && styles.langTextActive]}>Español 🇪🇸</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.langBtn, language === 'en' && styles.langBtnActive]} 
              onPress={() => setLanguage('en')}
            >
              <Text style={[styles.langText, language === 'en' && styles.langTextActive]}>English 🇺🇸</Text>
            </TouchableOpacity>
          </View>

          {/* Botones de Acción */}
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.btnText}>{t.btn_cancel}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.btnText}>{t.btn_save}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.8)' },
  modalView: { margin: 20, backgroundColor: '#1E1E1E', borderRadius: 15, padding: 25 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF', marginBottom: 20, textAlign: 'center' },
  label: { color: '#AAA', marginBottom: 5, marginTop: 10 },
  input: { backgroundColor: '#333', color: '#FFF', padding: 12, borderRadius: 8, fontSize: 16 },
  
  // Estilos del Selector de Idioma
  langRow: { flexDirection: 'row', gap: 10, marginTop: 5 },
  langBtn: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#444', alignItems: 'center', backgroundColor: '#222' },
  langBtnActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  langText: { color: '#888', fontWeight: 'bold' },
  langTextActive: { color: '#FFF' },

  btnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 },
  cancelBtn: { padding: 15 },
  saveBtn: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, minWidth: 100, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold' }
});

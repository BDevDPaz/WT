import React, { useState, useEffect } from 'react';
import { 
  Modal, View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert 
} from 'react-native';
import { getDB } from '../database/db';
import { getTexts } from '../utils/i18n';

export default function HistoryModal({ visible, onClose, onUpdate }) {
  const [sessions, setSessions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [language, setLanguage] = useState('es'); // Idioma por defecto
  
  // Estados para el formulario de edición
  const [editAddress, setEditAddress] = useState('');
  const [editStart, setEditStart] = useState(''); // Formato HH:MM
  const [editEnd, setEditEnd] = useState('');     // Formato HH:MM

  // Cargar historial e idioma al abrir
  useEffect(() => {
    if (visible) {
      loadHistory();
      loadLanguage();
    }
  }, [visible]);

  const loadLanguage = async () => {
    try {
      const db = getDB();
      const settings = await db.getFirstAsync("SELECT language FROM settings WHERE id = 1");
      if (settings?.language) setLanguage(settings.language);
    } catch (e) {
      console.log("Error loading language", e);
    }
  };

  const loadHistory = async () => {
    try {
      const db = getDB();
      // Solo mostramos activos. Los 'deleted' siguen en BD para el reporte rojo.
      const result = await db.getAllAsync("SELECT * FROM work_sessions WHERE status != 'deleted' ORDER BY start_time DESC LIMIT 50");
      setSessions(result);
    } catch (e) {
      console.log("Error cargando historial:", e);
    }
  };

  // Helper seguro para formatear HH:MM (Evita errores de locale/idioma en Android)
  const formatTimeSafe = (timestamp) => {
    if (!timestamp) return "00:00";
    const date = new Date(timestamp);
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditAddress(item.address);
    // Usamos el formateador seguro
    setEditStart(formatTimeSafe(item.start_time));
    setEditEnd(formatTimeSafe(item.end_time || Date.now()));
  };

  const handleSave = async (originalItem) => {
    // 1. Validar formato HH:MM exacto
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(editStart) || !timeRegex.test(editEnd)) {
      Alert.alert(
        language === 'en' ? "Format Error" : "Error de Formato", 
        language === 'en' ? "Use 24h format HH:MM (Ex: 14:30)" : "Usa el formato 24h HH:MM (Ej: 14:30)"
      );
      return;
    }

    try {
      const db = getDB();

      // 2. Reconstruir fechas (Timestamp) de forma segura
      const [sh, sm] = editStart.split(':');
      const [eh, em] = editEnd.split(':');

      // Creamos copias de fecha basadas en el start_time original
      const newStartDate = new Date(originalItem.start_time);
      newStartDate.setHours(parseInt(sh, 10), parseInt(sm, 10), 0, 0);

      const newEndDate = new Date(originalItem.start_time); // Usamos la misma base de fecha
      newEndDate.setHours(parseInt(eh, 10), parseInt(em, 10), 0, 0);

      // Si la hora de fin es menor a la de inicio, asumimos que es al día siguiente (madrugada)
      if (newEndDate < newStartDate) {
        newEndDate.setDate(newEndDate.getDate() + 1);
      }

      const newStartTs = newStartDate.getTime();
      const newEndTs = newEndDate.getTime();

      // 3. Ejecutar UPDATE (Anti-Fraude: Marca is_manual_edit = 1)
      await db.runAsync(
        `UPDATE work_sessions SET 
          address = ?, start_time = ?, end_time = ?, 
          is_manual_edit = 1, manual_note = 'Editado manual', status = 'completed'
        WHERE id = ?`,
        [editAddress, newStartTs, newEndTs, originalItem.id]
      );

      // 4. Insertar en LOG de Auditoría
      const logDetails = `Modificación manual: ${editStart} - ${editEnd} @ ${editAddress}`;
      await db.runAsync(
        "INSERT INTO audit_logs (session_id, action_type, details, timestamp) VALUES (?, ?, ?, ?)",
        [originalItem.id, 'MODIFICADO', logDetails, Date.now()]
      );
      
      Alert.alert(
        language === 'en' ? "Saved" : "Guardado", 
        language === 'en' ? "Record updated (Marked as Manual)." : "Registro actualizado (Marcado como Manual)."
      );
      setEditingId(null);
      loadHistory(); 
      onUpdate();    
    } catch (e) {
      console.error(e);
      Alert.alert("Error", e.message || "DB Error");
    }
  };

  const handleDelete = async (id) => {
    const title = language === 'en' ? "Delete Record?" : "¿Eliminar Registro?";
    const msg = language === 'en' 
      ? "This will appear as DELETED (Red) in the report." 
      : "Quedará marcado en ROJO en el reporte semanal (costo $0).";

    Alert.alert(
      title,
      msg,
      [
        { text: language === 'en' ? "Cancel" : "Cancelar", style: "cancel" },
        { 
          text: language === 'en' ? "Confirm" : "Confirmar", 
          style: "destructive", 
          onPress: async () => {
            try {
              const db = getDB();
              // Soft Delete
              await db.runAsync("UPDATE work_sessions SET status = 'deleted' WHERE id = ?", [id]);
              // Audit Log
              await db.runAsync(
                "INSERT INTO audit_logs (session_id, action_type, details, timestamp) VALUES (?, ?, ?, ?)",
                [id, 'ELIMINADO', 'Usuario eliminó este registro.', Date.now()]
              );
              loadHistory();
              onUpdate();
            } catch (e) {
              Alert.alert("Error", "No se pudo eliminar: " + e.message);
            }
          }
        }
      ]
    );
  };

  const t = getTexts(language); // Obtener diccionario base

  const renderItem = ({ item }) => {
    const isEditing = editingId === item.id;
    const dateStr = new Date(item.start_time).toLocaleDateString();
    
    // Colores visuales: Verde (Original) vs Naranja (Editado)
    const borderColor = item.is_manual_edit ? '#FFA500' : '#4CAF50'; 

    if (isEditing) {
      return (
        <View style={[styles.card, { borderColor: '#007AFF', borderWidth: 2 }]}>
          <Text style={styles.dateTitle}>{dateStr}</Text>
          
          <Text style={styles.label}>{language === 'en' ? "Address:" : "Dirección:"}</Text>
          <TextInput 
            style={styles.input} 
            value={editAddress} 
            onChangeText={setEditAddress} 
            placeholder="..."
            placeholderTextColor="#666"
          />
          
          <View style={styles.row}>
            <View style={{flex: 1, marginRight: 5}}>
              <Text style={styles.label}>{language === 'en' ? "Start (HH:MM):" : "Inicio (HH:MM):"}</Text>
              <TextInput 
                style={styles.input} 
                value={editStart} 
                onChangeText={setEditStart} 
                keyboardType="numbers-and-punctuation"
                maxLength={5}
              />
            </View>
            <View style={{flex: 1, marginLeft: 5}}>
              <Text style={styles.label}>{language === 'en' ? "End (HH:MM):" : "Fin (HH:MM):"}</Text>
              <TextInput 
                style={styles.input} 
                value={editEnd} 
                onChangeText={setEditEnd} 
                keyboardType="numbers-and-punctuation"
                maxLength={5}
              />
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditingId(null)}>
              <Text style={styles.btnText}>{t.btn_cancel}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={() => handleSave(item)}>
              <Text style={styles.btnText}>{t.btn_save}</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.card, { borderLeftColor: borderColor, borderLeftWidth: 5 }]}>
        <View style={styles.headerRow}>
          <Text style={styles.dateText}>{dateStr}</Text>
          {item.is_manual_edit 
            ? <Text style={styles.editedBadge}>✏️ {language === 'en' ? "Edited" : "Editado"}</Text> 
            : <Text style={styles.okBadge}>✅ Auto</Text>
          }
        </View>
        
        <Text style={styles.addressText}>{item.address}</Text>
        
        <Text style={styles.timeText}>
          {formatTimeSafe(item.start_time)} - 
          {item.end_time ? formatTimeSafe(item.end_time) : '...'}
        </Text>

        <View style={styles.actionRow}>
          <TouchableOpacity onPress={() => handleEdit(item)} style={styles.editBtn}>
            <Text style={styles.smallBtnText}>{language === 'en' ? "Edit" : "Editar"}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
            <Text style={styles.smallBtnText}>{language === 'en' ? "Delete" : "Eliminar"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose} presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Text style={styles.title}>{language === 'en' ? "History" : "Historial"}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>{language === 'en' ? "Close" : "Cerrar"}</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={sessions}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{padding: 20}}
          ListEmptyComponent={
            <Text style={{color: '#666', textAlign: 'center', marginTop: 20}}>
              {language === 'en' ? "No records." : "No hay registros."}
            </Text>
          }
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  topBar: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#333' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  closeText: { color: '#007AFF', fontSize: 16 },
  
  card: { backgroundColor: '#1E1E1E', padding: 15, marginBottom: 15, borderRadius: 8 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  dateTitle: { color: '#FFF', fontWeight: 'bold', marginBottom: 10 },
  dateText: { color: '#AAA', fontWeight: 'bold' },
  editedBadge: { color: '#FFA500', fontSize: 12, fontWeight: 'bold' },
  okBadge: { color: '#4CAF50', fontSize: 12, fontWeight: 'bold' },
  
  addressText: { color: '#FFF', fontSize: 16, marginBottom: 5 },
  timeText: { color: '#DDD', fontSize: 14, marginBottom: 10 },
  
  label: { color: '#888', fontSize: 12, marginTop: 5 },
  input: { backgroundColor: '#333', color: '#FFF', padding: 10, borderRadius: 5, marginTop: 2, fontSize: 16 },
  row: { flexDirection: 'row' },
  
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, gap: 10 },
  editBtn: { backgroundColor: '#333', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 4 },
  deleteBtn: { backgroundColor: '#3A1515', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 4 },
  saveBtn: { backgroundColor: '#007AFF', padding: 10, borderRadius: 5, flex: 1, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#444', padding: 10, borderRadius: 5, flex: 1, alignItems: 'center' },
  
  btnText: { color: '#FFF', fontWeight: 'bold' },
  smallBtnText: { color: '#FFF', fontSize: 12 }
});

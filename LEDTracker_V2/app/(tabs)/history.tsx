// app/(tabs)/history.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, SafeAreaView } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useLanguage } from '../../src/context/LanguageContext';
import { getDB } from '../../src/database/db';
import { WorkSession } from '../../src/types';

import { generateWeeklyReport } from '../../src/services/ReportGenerator';

export default function HistoryScreen() {
  const { t } = useLanguage();
  const [sessions, setSessions] = useState<WorkSession[]>([]);

  // Recargar datos cada vez que entramos a la pestaña
  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const loadHistory = async () => {
    const db = getDB();
    const res = await db.getAllAsync<WorkSession>(
      "SELECT * FROM work_sessions WHERE status != 'deleted' ORDER BY start_time DESC LIMIT 50"
    );
    setSessions(res);
  };

  const handlePdf = async () => {
    Alert.alert("Generando PDF", "Espere un momento...");
    const uri = await generateWeeklyReport(true); // true = abrir compartir
    if (!uri) Alert.alert("Error", "No hay datos para reportar.");
  };

  const renderItem = ({ item }: { item: WorkSession }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.date}>{new Date(item.start_time).toLocaleDateString()}</Text>
        <Text style={[styles.status, {color: item.status==='active'?'#4CAF50':'#AAA'}]}>
          {item.status.toUpperCase()}
        </Text>
      </View>
      <Text style={styles.address}>{item.address}</Text>
      <Text style={styles.time}>
        {new Date(item.start_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
        {' ➔ '}
        {item.end_time ? new Date(item.end_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '...'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>{t.history_title}</Text>
        <TouchableOpacity style={styles.pdfBtn} onPress={handlePdf}>
          <Text style={styles.pdfText}>📄 PDF</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={sessions}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20 }}
        ListEmptyComponent={<Text style={styles.empty}>{t.no_activity}</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  headerRow: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:20 },
  header: { fontSize: 28, fontWeight: 'bold', color: '#FFF' },
  pdfBtn: { backgroundColor: '#FFD700', padding: 8, borderRadius: 8 },
  pdfText: { fontWeight: 'bold', color: '#000' },
  card: { backgroundColor: '#1E1E1E', padding: 15, borderRadius: 12, marginBottom: 10, borderWidth:1, borderColor:'#333' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  date: { color: '#AAA', fontWeight:'bold' },
  status: { fontSize: 10, fontWeight:'bold' },
  address: { color: '#FFF', fontSize: 16, marginBottom: 5 },
  time: { color: '#888' },
  empty: { color: '#666', textAlign: 'center', marginTop: 50 }
});

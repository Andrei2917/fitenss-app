import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import * as Clipboard from 'expo-clipboard'; // Use Expo's clipboard for modern React Native
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { coachApi } from '../../services/api/coachApi'; 
import { colors } from '../../constants/colors';
import { theme } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const CoachDashboardScreen = () => {
  const coach = useSelector((state: RootState) => state.auth.coach);
  
  const [clients, setClients] = useState<any[]>([]);
  const [accessCodes, setAccessCodes] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch the Clients (and codes if you add that backend route later!)
  const fetchDashboardData = async () => {
    if (!coach?.id) return;
    try {
      // If you have a getClients method, it will load them here. 
      // (Wrapped in a check just in case it's not fully built yet)
      if (coachApi.getClients) {
        const clientsData = await coachApi.getClients(coach.id);
        setClients(clientsData);
      }
      
      // If you build a getAccessCodes method later, uncomment this:
      if (coachApi.getAccessCodes) {
        const codesData = await coachApi.getAccessCodes(coach.id);
        setAccessCodes(codesData);
      }
      
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchDashboardData(); };

  // THE WIRED-UP GENERATOR FUNCTION
  // THE WIRED-UP GENERATOR FUNCTION
  const handleGenerateCode = async () => {
    if (!coach?.id) return;
    setIsGenerating(true);
    try {
      // The API returns the FULL object from the database, not just a string!
      const newCodeObj = await coachApi.generateAccessCode(coach.id);
      
      // Since it's already a perfect object, we just add it straight to the list!
      setAccessCodes(prevCodes => [newCodeObj, ...prevCodes]);
      
      Alert.alert('Success', 'New access code generated!');
      
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to generate code.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (code: string) => {
    await Clipboard.setStringAsync(code);
    Alert.alert('Copied!', `Access code ${code} copied to clipboard.`);
  };

  // --- UI: THE NEW ACCESS CODES SECTION ---
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.pageTitle}>Dashboard</Text>
      
      <View style={styles.codesCard}>
        <View style={styles.codesHeaderRow}>
          <Text style={styles.sectionTitle}>Access Codes</Text>
          <TouchableOpacity 
            style={styles.generateBtn} 
            onPress={handleGenerateCode}
            disabled={isGenerating}
          >
            {isGenerating ? <ActivityIndicator size="small" color={colors.white} /> : <Text style={styles.generateBtnText}>+ New Code</Text>}
          </TouchableOpacity>
        </View>

        <Text style={styles.codesSubtext}>Give these codes to your real-life clients so they can bypass the paywall.</Text>

        {accessCodes.length === 0 ? (
           <Text style={styles.emptyCodesText}>No access codes generated yet.</Text>
        ) : (
          <FlatList 
            horizontal
            showsHorizontalScrollIndicator={false}
            data={accessCodes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[styles.codePill, item.usedAt ? styles.codePillUsed : styles.codePillActive]}
                onPress={() => !item.usedAt && copyToClipboard(item.code)}
              >
                <Text style={[styles.codeText, item.usedAt && styles.codeTextUsed]}>
                  {item.code}
                </Text>
                <View style={[styles.statusBadge, item.usedAt ? styles.badgeUsed : styles.badgeActive]}>
                  <Text style={styles.badgeText}>{item.usedAt ? 'USED' : 'ACTIVE'}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      <Text style={styles.sectionTitleClient}>My Clients ({clients?.length || 0})</Text>
    </View>
  );

  // --- UI: THE CLIENT LIST ---
  const renderClient = ({ item }: { item: any }) => (
    <View style={styles.clientCard}>
      <View style={styles.clientAvatar}>
        <Text style={styles.avatarText}>{item.name?.charAt(0)?.toUpperCase() || 'C'}</Text>
      </View>
      <View style={styles.clientInfo}>
        <Text style={styles.clientName}>{item.name}</Text>
        <Text style={styles.clientEmail}>{item.email}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
    </View>
  );

  if (isLoading) return <ActivityIndicator size="large" color={colors.primary} style={styles.centered} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={clients}
        keyExtractor={(item) => item.id}
        renderItem={renderClient}
        ListHeaderComponent={renderHeader}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={<Text style={styles.emptyClientsText}>You don't have any linked clients yet.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  headerContainer: { padding: theme.spacing.lg },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: colors.primary, marginBottom: 20 },
  
  codesCard: { backgroundColor: colors.white, padding: 20, borderRadius: 16, marginBottom: 30, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  codesHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  codesSubtext: { fontSize: 14, color: colors.textLight, marginBottom: 15, lineHeight: 20 },
  
  generateBtn: { backgroundColor: colors.primary, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  generateBtnText: { color: colors.white, fontWeight: 'bold', fontSize: 13 },
  
  emptyCodesText: { color: colors.textLight, fontStyle: 'italic', marginTop: 10 },
  
  codePill: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginRight: 15, borderWidth: 1 },
  codePillActive: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  codePillUsed: { backgroundColor: '#f9fafb', borderColor: '#e5e7eb' },
  codeText: { fontSize: 18, fontWeight: 'bold', letterSpacing: 2, marginRight: 15, color: colors.text },
  codeTextUsed: { color: colors.textLight, textDecorationLine: 'line-through' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeActive: { backgroundColor: '#22c55e' },
  badgeUsed: { backgroundColor: '#9ca3af' },
  badgeText: { color: colors.white, fontSize: 10, fontWeight: 'bold' },

  sectionTitleClient: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 15, paddingHorizontal: theme.spacing.lg },
  clientCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, padding: 15, marginHorizontal: theme.spacing.lg, marginBottom: 10, borderRadius: 12, elevation: 1 },
  clientAvatar: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { color: colors.white, fontSize: 20, fontWeight: 'bold' },
  clientInfo: { flex: 1 },
  clientName: { fontSize: 16, fontWeight: 'bold', color: colors.text },
  clientEmail: { fontSize: 14, color: colors.textLight },
  emptyClientsText: { textAlign: 'center', color: colors.textLight, marginTop: 20, paddingHorizontal: 20 },
});

export default CoachDashboardScreen;
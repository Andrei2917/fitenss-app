import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl, Platform, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { coachApi } from '../../services/api/coachApi';

export default function CoachDashboardScreen() {
  const coach = useSelector((state: RootState) => state.auth.coach);

  const [clients, setClients] = useState<any[]>([]);
  const [codes, setCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);

  const fetchData = async () => {
    if (!coach?.id) return;
    try {
      if (coachApi.getClients) setClients(await coachApi.getClients(coach.id));
      if (coachApi.getAccessCodes) setCodes(await coachApi.getAccessCodes(coach.id));
    } catch { /* silent */ }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const generateCode = async () => {
    if (!coach?.id) return;
    setGenerating(true);
    try {
      const code = await coachApi.generateAccessCode(coach.id);
      setCodes(prev => [code, ...prev]);
      Alert.alert('Code Created', 'New access code is ready to share!');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to generate code.');
    } finally { setGenerating(false); }
  };

  const copyCode = async (code: string) => {
    await Clipboard.setStringAsync(code);
    Alert.alert('Copied!', `"${code}" copied to clipboard.`);
  };

  const renderClient = ({ item }: { item: any }) => (
    <View style={S.clientCard}>
      <LinearGradient colors={['#21277B', '#4A6FA5']} style={S.clientAvatar}>
        <Text style={S.clientInitial}>{item.name?.charAt(0)?.toUpperCase() || 'C'}</Text>
      </LinearGradient>
      <View style={S.clientInfo}>
        <Text style={S.clientName}>{item.name}</Text>
        <Text style={S.clientEmail}>{item.email}</Text>
      </View>
      <View style={S.activeChip}>
        <View style={S.activeDot} />
        <Text style={S.activeText}>Active</Text>
      </View>
    </View>
  );

  if (loading) return (
    <View style={S.loader}><ActivityIndicator size="large" color="#21277B" /></View>
  );

  const Header = () => (
    <View>
      {/* Stats row */}
      <View style={S.statsRow}>
        <View style={S.statCard}>
          <Text style={S.statNum}>{clients.length}</Text>
          <Text style={S.statLabel}>Clients</Text>
        </View>
        <View style={[S.statCard, S.statCardMid]}>
          <Text style={S.statNum}>{codes.filter(c => !c.usedAt).length}</Text>
          <Text style={S.statLabel}>Active Codes</Text>
        </View>
        <View style={S.statCard}>
          <Text style={S.statNum}>{codes.filter(c => c.usedAt).length}</Text>
          <Text style={S.statLabel}>Redeemed</Text>
        </View>
      </View>

      {/* Access Codes */}
      <View style={S.section}>
        <View style={S.sectionHeader}>
          <View>
            <Text style={S.sectionTitle}>Access Codes</Text>
            <Text style={S.sectionSub}>Share with clients to bypass paywall</Text>
          </View>
          <TouchableOpacity style={S.genBtn} onPress={generateCode} disabled={generating} activeOpacity={0.85}>
            {generating
              ? <ActivityIndicator size="small" color="#fff" />
              : (
                <>
                  <Ionicons name="add" size={16} color="#fff" />
                  <Text style={S.genBtnText}>New Code</Text>
                </>
              )
            }
          </TouchableOpacity>
        </View>

        {codes.length === 0
          ? (
            <View style={S.emptyCodeWrap}>
              <Ionicons name="key-outline" size={28} color="#C4C9D4" />
              <Text style={S.emptyCodeText}>No codes yet — tap New Code to generate one</Text>
            </View>
          )
          : (
            <FlatList
              horizontal showsHorizontalScrollIndicator={false}
              data={codes} keyExtractor={i => i.id}
              contentContainerStyle={{ gap: 10, paddingVertical: 4 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[S.codePill, item.usedAt && S.codePillUsed]}
                  onPress={() => !item.usedAt && copyCode(item.code)}
                  activeOpacity={item.usedAt ? 1 : 0.8}
                >
                  <Text style={[S.codeValue, item.usedAt && S.codeValueUsed]}>{item.code}</Text>
                  <View style={[S.codeStatus, item.usedAt ? S.codeStatusUsed : S.codeStatusActive]}>
                    <Text style={S.codeStatusText}>{item.usedAt ? 'USED' : 'ACTIVE'}</Text>
                  </View>
                  {!item.usedAt && (
                    <Ionicons name="copy-outline" size={14} color="#21277B" style={{ marginLeft: 6 }} />
                  )}
                </TouchableOpacity>
              )}
            />
          )
        }
      </View>

      {/* Clients header */}
      <View style={S.clientsHeader}>
        <Text style={S.sectionTitle}>My Clients</Text>
        <View style={S.countPill}>
          <Text style={S.countText}>{clients.length}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={S.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#21277B', '#2E3596']} style={S.hero}>
        <Text style={S.heroTitle}>Dashboard</Text>
        <Text style={S.heroSub}>Welcome back, {coach?.name?.split(' ')[0] || 'Coach'} 👋</Text>
        <View style={S.heroCurve} />
      </LinearGradient>

      <FlatList
        data={clients} keyExtractor={i => i.id}
        renderItem={renderClient}
        ListHeaderComponent={<Header />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#21277B" />}
        contentContainerStyle={S.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={S.emptyClients}>
            <View style={S.emptyIcon}>
              <Ionicons name="people-outline" size={32} color="#21277B" />
            </View>
            <Text style={S.emptyTitle}>No clients yet</Text>
            <Text style={S.emptySub}>Share an access code to get started</Text>
          </View>
        }
      />
    </View>
  );
}

const CARD_SHADOW = Platform.select({
  ios: { shadowColor: '#21277B', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 10 },
  android: { elevation: 3 },
});

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F2F4FA' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2F4FA' },
  list: { paddingBottom: 32 },

  hero: { paddingTop: 56, paddingBottom: 36, paddingHorizontal: 20 },
  heroTitle: { fontSize: 30, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 3 },
  heroCurve: { position: 'absolute', bottom: -1, left: 0, right: 0, height: 20, backgroundColor: '#F2F4FA', borderTopLeftRadius: 24, borderTopRightRadius: 24 },

  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginTop: 8, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', ...CARD_SHADOW },
  statCardMid: { borderWidth: 1.5, borderColor: '#DADEFD', backgroundColor: '#F7F8FF' },
  statNum: { fontSize: 24, fontWeight: '800', color: '#21277B', letterSpacing: -0.5 },
  statLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '600', marginTop: 2 },

  section: { backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 16, marginBottom: 16, padding: 16, ...CARD_SHADOW },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0D1117' },
  sectionSub: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  genBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#21277B', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20,
    ...Platform.select({ ios: { shadowColor: '#21277B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }, android: { elevation: 6 } }),
  },
  genBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  emptyCodeWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  emptyCodeText: { flex: 1, fontSize: 13, color: '#9CA3AF', lineHeight: 18 },

  codePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7FFF9', borderWidth: 1.5, borderColor: '#A7F3D0', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  codePillUsed: { backgroundColor: '#F9FAFB', borderColor: '#E5E7EB' },
  codeValue: { fontSize: 17, fontWeight: '800', letterSpacing: 2, color: '#0D1117', marginRight: 10 },
  codeValueUsed: { color: '#9CA3AF', textDecorationLine: 'line-through' },
  codeStatus: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  codeStatusActive: { backgroundColor: '#10B981' },
  codeStatusUsed: { backgroundColor: '#9CA3AF' },
  codeStatusText: { color: '#fff', fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },

  clientsHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, marginBottom: 10 },
  countPill: { backgroundColor: '#EEF1FF', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  countText: { fontSize: 12, color: '#21277B', fontWeight: '700' },

  clientCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, marginHorizontal: 16, marginBottom: 10, padding: 14, ...CARD_SHADOW },
  clientAvatar: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  clientInitial: { color: '#fff', fontSize: 18, fontWeight: '700' },
  clientInfo: { flex: 1 },
  clientName: { fontSize: 15, fontWeight: '700', color: '#0D1117' },
  clientEmail: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  activeChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#F0FDF4', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  activeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#10B981' },
  activeText: { fontSize: 11, color: '#10B981', fontWeight: '700' },

  emptyClients: { alignItems: 'center', paddingTop: 32, paddingHorizontal: 40 },
  emptyIcon: { width: 68, height: 68, borderRadius: 34, backgroundColor: 'rgba(33,39,123,0.08)', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#0D1117', marginBottom: 4 },
  emptySub: { fontSize: 13, color: '#9CA3AF', textAlign: 'center' },
});

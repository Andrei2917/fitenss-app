import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, ActivityIndicator, 
  Alert, RefreshControl, TextInput, TouchableOpacity 
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useSelector } from 'react-redux';
import { useStripe } from '@stripe/stripe-react-native';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../../store';
import { videoApi } from '../../services/api/videoApi';
import { subscriptionApi } from '../../services/api/subscriptionApi';
import { config } from '../../constants/config';
import { Button } from '../../components/common/Button';
import { colors } from '../../constants/colors';
import { theme } from '../../constants/theme';

interface Video { id: string; title: string; url: string; category: string; }
interface CoachSubscription {
  subscriptionId: string;
  status: string;
  coachId: string;
  coachName: string;
  coachSpecialty: string;
  endDate: string;
  videos: Video[];
}

const TrainingScreen = ({ route }: any) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  
  const [subscriptions, setSubscriptions] = useState<CoachSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchasingSubId, setPurchasingSubId] = useState<string | null>(null);

  // Access Code (collapsed section)
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [isSubmittingCode, setIsSubmittingCode] = useState(false);

  const getCleanVideoUrl = (rawUrl: string) => {
    if (!rawUrl) return '';
    let cleanUrl = rawUrl;
    if (rawUrl.includes('vimeo.com') && !rawUrl.includes('player.vimeo.com')) {
      const videoId = rawUrl.split('/').filter(Boolean).pop(); 
      cleanUrl = `https://player.vimeo.com/video/${videoId}`;
    }
    const separator = cleanUrl.includes('?') ? '&' : '?';
    return `${cleanUrl}${separator}playsinline=1&app_id=122963`;
  };

  const fetchAccess = async () => {
    if (!user?.id) return;
    try {
      const data = await videoApi.getClientVideos(user.id);
      if (data.subscriptions && data.subscriptions.length > 0) {
        setSubscriptions(data.subscriptions);
      } else if (data.status !== 'none') {
        // Backward compat: single sub
        setSubscriptions([{
          subscriptionId: data.subscriptionId,
          status: data.status,
          coachId: '',
          coachName: data.coachName,
          coachSpecialty: '',
          endDate: '',
          videos: data.videos || [],
        }]);
      } else {
        setSubscriptions([]);
      }
    } catch (error: any) {
      if (error.message !== 'No access found') {
        Alert.alert('Error', error.message);
      }
      setSubscriptions([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchAccess(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchAccess(); };

  // Handle direct purchase from CoachProfileScreen
  useEffect(() => {
    if (route?.params?.directPurchaseCoachId && user?.id) {
      handleDirectPurchase(route.params.directPurchaseCoachId, route.params.directPurchaseCoachName || 'Coach');
    }
  }, [route?.params?.directPurchaseCoachId]);

  const handleDirectPurchase = async (coachId: string, coachName: string) => {
    setIsPurchasing(true);
    try {
      const result = await subscriptionApi.purchaseDirect(user!.id, coachId);
      
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: `${coachName}'s Academy`,
        paymentIntentClientSecret: result.clientSecret,
        defaultBillingDetails: { name: user?.name },
        returnURL: 'fitnessapp://stripe-redirect',
      });
      if (initError) throw new Error(initError.message);

      const { error: presentError } = await presentPaymentSheet();
      if (presentError) {
        if (presentError.code === 'Canceled') return;
        throw new Error(presentError.message);
      }

      await fetch(`${config.API_URL}/payments/confirm-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: result.subscriptionId }),
      });

      Alert.alert('Payment Successful! 🎉', `You now have access to ${coachName}'s courses for 1 month!`);
      await fetchAccess();
    } catch (error: any) {
      if (error.message !== 'Canceled') {
        Alert.alert('Payment Error', error.message);
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  const handlePurchasePending = async (sub: CoachSubscription) => {
    setPurchasingSubId(sub.subscriptionId);
    try {
      const clientSecret = await videoApi.createPaymentIntent(sub.subscriptionId);
      
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: `${sub.coachName}'s Academy`,
        paymentIntentClientSecret: clientSecret,
        defaultBillingDetails: { name: user?.name },
        returnURL: 'fitnessapp://stripe-redirect',
      });
      if (initError) throw new Error(initError.message);

      const { error: presentError } = await presentPaymentSheet();
      if (presentError) {
        if (presentError.code === 'Canceled') return;
        throw new Error(presentError.message);
      }

      await fetch(`${config.API_URL}/payments/confirm-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: sub.subscriptionId }),
      });

      Alert.alert('Payment Successful!', 'Your courses are now unlocked!');
      await fetchAccess();
    } catch (error: any) {
      Alert.alert('Payment Error', error.message);
    } finally {
      setPurchasingSubId(null);
    }
  };

  const handleRedeemCode = async () => {
    if (!accessCode.trim()) return Alert.alert('Error', 'Please enter an access code.');
    if (!user?.id) return Alert.alert('Error', 'User ID not found.');
    setIsSubmittingCode(true);
    try {
      await subscriptionApi.redeemAccessCode(user.id, accessCode);
      Alert.alert('Success!', 'Coach linked successfully.');
      setAccessCode('');
      setShowCodeInput(false);
      fetchAccess();
    } catch (error: any) {
      Alert.alert('Invalid Code', error.message);
    } finally {
      setIsSubmittingCode(false);
    }
  };

  if (isLoading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  const activeSubs = subscriptions.filter(s => s.status === 'active');
  const pendingSubs = subscriptions.filter(s => s.status === 'pending');

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={styles.scrollContent}
    >
      <Text style={styles.headerTitle}>My Courses</Text>

      {/* ============================= */}
      {/* PENDING SUBSCRIPTIONS         */}
      {/* ============================= */}
      {pendingSubs.map(sub => (
        <View key={sub.subscriptionId} style={styles.pendingCard}>
          <View style={styles.pendingHeader}>
            <Ionicons name="lock-closed" size={20} color={colors.white} />
            <Text style={styles.pendingTitle}>{sub.coachName}'s Courses</Text>
          </View>
          <Text style={styles.pendingDesc}>
            Unlock 1 month of access to all of {sub.coachName}'s premium courses.
          </Text>
          {purchasingSubId === sub.subscriptionId ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <TouchableOpacity style={styles.unlockBtn} onPress={() => handlePurchasePending(sub)}>
              <Text style={styles.unlockText}>Subscribe — Monthly</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.pendingBadge}>🔒 {sub.videos.length} Videos Locked</Text>
        </View>
      ))}

      {/* ============================= */}
      {/* ACTIVE SUBSCRIPTIONS + VIDEOS */}
      {/* ============================= */}
      {activeSubs.map(sub => {
        const grouped = sub.videos.reduce((acc, video) => {
          const cat = video.category || 'General';
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push(video);
          return acc;
        }, {} as Record<string, Video[]>);

        return (
          <View key={sub.subscriptionId} style={styles.coachSection}>
            <View style={styles.coachBanner}>
              <Text style={styles.coachBannerName}>{sub.coachName}</Text>
              <Text style={styles.coachBannerDate}>
                Renews: {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : 'Active'}
              </Text>
            </View>

            {Object.keys(grouped).map(category => (
              <View key={category} style={styles.courseSection}>
                <Text style={styles.courseHeader}>{category}</Text>
                {grouped[category].map(video => (
                  <View key={video.id} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.videoTitle}>{video.title}</Text>
                    </View>
                    <View style={styles.videoContainer}>
                      <WebView 
                        source={{ 
                          html: `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"><style>body{margin:0;padding:0;background:#000;display:flex;justify-content:center;align-items:center;height:100vh;overflow:hidden}iframe{width:100vw;height:100vh;border:none}</style></head><body><iframe src="${getCleanVideoUrl(video.url)}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></body></html>`
                        }} 
                        style={styles.webview} 
                        allowsFullscreenVideo={true} 
                        javaScriptEnabled={true} 
                        scrollEnabled={false}
                        bounces={false}
                      />
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </View>
        );
      })}

      {/* ============================= */}
      {/* ADD ANOTHER COACH             */}
      {/* ============================= */}
      <View style={styles.addCoachSection}>
        <Text style={styles.addCoachTitle}>Add Another Coach</Text>
        
        <TouchableOpacity 
          style={styles.codeToggle} 
          onPress={() => setShowCodeInput(!showCodeInput)}
        >
          <Ionicons name="key-outline" size={18} color={colors.primary} />
          <Text style={styles.codeToggleText}>Have a referral code?</Text>
          <Ionicons name={showCodeInput ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textLight} />
        </TouchableOpacity>

        {showCodeInput && (
          <View style={styles.codeSection}>
            <TextInput
              style={styles.codeInput}
              placeholder="Enter Access Code..."
              value={accessCode}
              onChangeText={setAccessCode}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {isSubmittingCode ? (
              <ActivityIndicator color={colors.primary} style={{ marginTop: 10 }} />
            ) : (
              <Button title="Submit Code" onPress={handleRedeemCode} />
            )}
          </View>
        )}

        <Text style={styles.orText}>— or browse coaches from the Home tab —</Text>
      </View>

      {isPurchasing && (
        <View style={styles.purchasingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.purchasingText}>Processing payment...</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: theme.spacing.lg },
  scrollContent: { paddingBottom: 100 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: colors.primary, marginBottom: 20 },

  // Pending cards
  pendingCard: { backgroundColor: colors.primary, padding: 20, borderRadius: 16, marginBottom: 20, elevation: 4 },
  pendingHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  pendingTitle: { color: colors.white, fontSize: 18, fontWeight: 'bold' },
  pendingDesc: { color: colors.accentIce, fontSize: 14, lineHeight: 20, marginBottom: 15 },
  unlockBtn: { backgroundColor: colors.white, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, alignSelf: 'flex-start' },
  unlockText: { color: colors.primary, fontWeight: 'bold', fontSize: 15 },
  pendingBadge: { color: colors.accentIce, fontSize: 12, marginTop: 12 },

  // Coach sections
  coachSection: { marginBottom: 30 },
  coachBanner: { backgroundColor: colors.accentIce, padding: 14, borderRadius: 12, marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  coachBannerName: { fontSize: 16, fontWeight: 'bold', color: colors.primary },
  coachBannerDate: { fontSize: 12, color: colors.textLight },

  courseSection: { marginBottom: 20 },
  courseHeader: { fontSize: 20, fontWeight: 'bold', color: colors.primary, marginBottom: 15, borderBottomWidth: 2, borderBottomColor: colors.accentIce, paddingBottom: 5 },
  card: { backgroundColor: colors.white, borderRadius: 12, marginBottom: 20, overflow: 'hidden', elevation: 3 },
  cardHeader: { padding: 15, backgroundColor: colors.white },
  videoTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text },
  videoContainer: { height: 220, width: '100%', backgroundColor: '#000' },
  webview: { flex: 1, backgroundColor: 'transparent' },

  // Add coach section
  addCoachSection: { backgroundColor: colors.white, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: colors.border, marginTop: 10 },
  addCoachTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 12 },
  codeToggle: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10 },
  codeToggleText: { flex: 1, fontSize: 15, color: colors.primary, fontWeight: '600' },
  codeSection: { marginTop: 10 },
  codeInput: { backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#e0e0e0', padding: 14, borderRadius: 12, fontSize: 16, marginBottom: 10, textAlign: 'center', letterSpacing: 2 },
  orText: { textAlign: 'center', color: colors.textLight, fontSize: 13, marginTop: 15 },

  purchasingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.9)', justifyContent: 'center', alignItems: 'center' },
  purchasingText: { marginTop: 10, fontSize: 16, color: colors.primary, fontWeight: '600' },
});

export default TrainingScreen;
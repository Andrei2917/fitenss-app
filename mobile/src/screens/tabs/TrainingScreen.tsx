import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  Alert, 
  RefreshControl, 
  TextInput 
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useSelector } from 'react-redux';
import { useStripe } from '@stripe/stripe-react-native';

// --- Redux & Services ---
import { RootState } from '../../store';
import { videoApi } from '../../services/api/videoApi';
import { subscriptionApi } from '../../services/api/subscriptionApi';

// --- Components & Theme ---
import { Button } from '../../components/common/Button';
import { colors } from '../../constants/colors';
import { theme } from '../../constants/theme';

interface Video { 
  id: string; 
  title: string; 
  url: string; 
  category: string; 
}

const TrainingScreen = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  
  // --- STATE ---
  const [status, setStatus] = useState<'none' | 'pending' | 'active'>('none');
  const [subId, setSubId] = useState('');
  const [coachName, setCoachName] = useState('');
  const [groupedCourses, setGroupedCourses] = useState<Record<string, Video[]>>({});
  
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Access Code State
  const [accessCode, setAccessCode] = useState('');
  const [isSubmittingCode, setIsSubmittingCode] = useState(false);

  // --- VIMEO URL CLEANER ---
  // Keeps your player clean and native-looking based on your Vimeo Pro preset
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

  // --- DATA FETCHING ---
  const fetchAccess = async () => {
    if (!user?.id) return;
    
    try {
      const data = await videoApi.getClientVideos(user.id);
      setStatus(data.status || 'none');
      setSubId(data.subscriptionId);
      setCoachName(data.coachName);
      
      const videosArray: Video[] = data.videos || [];
      const groups = videosArray.reduce((acc, video) => {
        const courseName = video.category || 'General Training';
        if (!acc[courseName]) acc[courseName] = [];
        acc[courseName].push(video);
        return acc;
      }, {} as Record<string, Video[]>);
      
      setGroupedCourses(groups);
    } catch (error: any) {
      if (error.message !== 'No access found') {
        Alert.alert('Error', error.message);
      }
      setStatus('none');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { 
    fetchAccess(); 
  }, []);

  const onRefresh = () => { 
    setRefreshing(true); 
    fetchAccess(); 
  };

  // --- HANDLERS ---
  const handleRedeemCode = async () => {
    if (!accessCode.trim()) return Alert.alert('Error', 'Please enter an access code.');
    if (!user?.id) return Alert.alert('Error', 'User ID not found. Please log in again.');
    
    setIsSubmittingCode(true);
    try {
      await subscriptionApi.redeemAccessCode(user.id, accessCode);
      Alert.alert('Success!', 'Coach linked successfully.');
      setAccessCode('');
      fetchAccess(); 
    } catch (error: any) {
      Alert.alert('Invalid Code', error.message || 'Please check the code and try again.');
    } finally {
      setIsSubmittingCode(false);
    }
  };

  const handlePurchase = async () => {
    setIsPurchasing(true);
    try {
      const clientSecret = await videoApi.createPaymentIntent(subId);
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: `${coachName}'s Academy`,
        paymentIntentClientSecret: clientSecret,
        defaultBillingDetails: { name: user?.name },
      });
      
      if (initError) throw new Error(initError.message);

      const { error: presentError } = await presentPaymentSheet();
      if (presentError) {
        if (presentError.code === 'Canceled') return;
        throw new Error(presentError.message);
      }
      
      Alert.alert('Payment Successful!', 'Pull down to refresh your active courses!');
    } catch (error: any) {
      Alert.alert('Payment Error', error.message);
    } finally {
      setIsPurchasing(false);
    }
  };

  // --- RENDERERS ---
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={styles.scrollContent}
    >
      <Text style={styles.headerTitle}>
        {status === 'none' ? 'Find Your Coach' : `${coachName}'s Academy`}
      </Text>

      {/* 1. NO COACH / ACCESS CODE UI */}
      {status === 'none' && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Link Your Coach</Text>
          <Text style={styles.emptySubtext}>
            Enter the secure access code provided by your coach to unlock their premium curriculum.
          </Text>
          
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.codeInput}
              placeholder="Enter Access Code..."
              value={accessCode}
              onChangeText={setAccessCode}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {isSubmittingCode ? (
              <ActivityIndicator color={colors.primary} style={{ marginTop: 15 }} />
            ) : (
              <Button title="Submit Code" onPress={handleRedeemCode} />
            )}
          </View>
        </View>
      )}

      {/* 2. PENDING / PAYWALL UI */}
      {status === 'pending' && (
        <View>
          <View style={styles.paywallBanner}>
            <Text style={styles.paywallTitle}>Unlock All Courses</Text>
            <Text style={styles.paywallDesc}>
              Purchase a subscription to unlock lifetime access to {coachName}'s premium video curriculum.
            </Text>
            {isPurchasing ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Button title="Subscribe Securely" onPress={handlePurchase} />
            )}
          </View>

          <Text style={styles.sectionHeader}>Courses Included:</Text>
          {Object.keys(groupedCourses).map(course => (
            <View key={course} style={styles.coursePreviewCard}>
              <Text style={styles.coursePreviewTitle}>{course}</Text>
              <View style={styles.coursePreviewBadge}>
                <Text style={styles.coursePreviewCount}>🔒 {groupedCourses[course].length} Videos</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* 3. ACTIVE / VIDEO PLAYER UI */}
      {status === 'active' && (
        <View>
          {Object.keys(groupedCourses).map(course => (
            <View key={course} style={styles.courseSection}>
              <Text style={styles.courseHeader}>{course}</Text>
              
              {groupedCourses[course].map(video => (
                <View key={video.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.videoTitle}>{video.title}</Text>
                  </View>
                  <View style={styles.videoContainer}>
                    <WebView 
                      source={{ 
                        html: `
                          <!DOCTYPE html>
                          <html>
                            <head>
                              <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                              <style>
                                body { margin: 0; padding: 0; background-color: #000; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; }
                                iframe { width: 100vw; height: 100vh; border: none; }
                              </style>
                            </head>
                            <body>
                              <iframe src="${getCleanVideoUrl(video.url)}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
                            </body>
                          </html>
                        ` 
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
      )}
    </ScrollView>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  // Base
  container: { flex: 1, backgroundColor: colors.background, padding: theme.spacing.lg },
  scrollContent: { paddingBottom: 100 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: colors.primary, marginBottom: 20 },
  
  // Access Code UI
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 30, backgroundColor: colors.white, padding: 25, borderRadius: 16, elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  emptyText: { fontSize: 22, fontWeight: 'bold', color: colors.text, marginBottom: 10 },
  emptySubtext: { fontSize: 15, color: colors.textLight, textAlign: 'center', marginBottom: 25, lineHeight: 22 },
  inputWrapper: { width: '100%' },
  codeInput: { backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#e0e0e0', padding: 15, borderRadius: 12, fontSize: 16, marginBottom: 15, textAlign: 'center', letterSpacing: 2 },

  // Paywall UI
  paywallBanner: { backgroundColor: colors.primary, padding: 25, borderRadius: 16, marginBottom: 30, elevation: 5 },
  paywallTitle: { color: colors.white, fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  paywallDesc: { color: colors.accentIce, fontSize: 15, marginBottom: 20, lineHeight: 22 },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 15 },
  coursePreviewCard: { backgroundColor: colors.white, padding: 18, borderRadius: 12, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
  coursePreviewTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text, flex: 1 },
  coursePreviewBadge: { backgroundColor: '#f0f0f0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  coursePreviewCount: { fontSize: 13, fontWeight: 'bold', color: colors.textLight },

  // Video UI
  courseSection: { marginBottom: 30 },
  courseHeader: { fontSize: 20, fontWeight: 'bold', color: colors.primary, marginBottom: 15, borderBottomWidth: 2, borderBottomColor: colors.accentIce, paddingBottom: 5 },
  card: { backgroundColor: colors.white, borderRadius: 12, marginBottom: 20, overflow: 'hidden', elevation: 3 },
  cardHeader: { padding: 15, backgroundColor: colors.white },
  videoTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text },
  videoContainer: { height: 220, width: '100%', backgroundColor: '#000' },
  webview: { flex: 1, backgroundColor: 'transparent' },
});

export default TrainingScreen;
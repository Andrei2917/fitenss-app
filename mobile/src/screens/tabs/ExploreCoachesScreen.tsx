import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { coachApi } from '../../services/api/coachApi';
import { videoApi } from '../../services/api/videoApi'; // To check their current subscription!
import { colors } from '../../constants/colors';
import { theme } from '../../constants/theme';

interface Coach {
  id: string;
  name: string;
  specialty: string;
}

const ExploreCoachesScreen = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [linkedCoachName, setLinkedCoachName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadScreenData = async () => {
    if (!user?.id) return;
    try {
      // 1. Fetch all available coaches
      const coachesData = await coachApi.getAllCoaches();
      setCoaches(coachesData);

      // 2. Ask the video API who we are currently subscribed to!
      const accessData = await videoApi.getClientVideos(user.id);
      if (accessData.status !== 'none') {
        setLinkedCoachName(accessData.coachName);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadScreenData();
  }, []);

  const renderCoachCard = ({ item }: { item: Coach }) => {
    // Check if this specific coach in the list is the one the user is linked to
    const isMyCoach = item.name === linkedCoachName;

    return (
      <View style={[styles.card, isMyCoach && styles.activeCard]}>
        <View style={styles.infoContainer}>
          <Text style={styles.coachName}>{item.name}</Text>
          <Text style={styles.specialty}>{item.specialty || 'Fitness Coach'}</Text>
        </View>

        {isMyCoach ? (
          <View style={styles.badgeActive}>
            <Text style={styles.badgeActiveText}>Your Coach</Text>
          </View>
        ) : (
          <View style={styles.badgeInactive}>
            <Text style={styles.badgeInactiveText}>Available</Text>
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Find Your Coach</Text>
      <Text style={styles.subtitle}>Discover professionals or view your current connections.</Text>

      <FlatList
        data={coaches}
        keyExtractor={(item) => item.id}
        renderItem={renderCoachCard}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: theme.spacing.lg },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.primary, marginBottom: 5 },
  subtitle: { fontSize: 14, color: colors.textLight, marginBottom: 20 },
  
  card: { backgroundColor: colors.white, padding: 20, borderRadius: 12, marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2 },
  activeCard: { borderColor: colors.primary, borderWidth: 2 }, // Highlights their coach!
  
  infoContainer: { flex: 1 },
  coachName: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  specialty: { fontSize: 14, color: colors.textLight, marginTop: 4 },
  
  badgeActive: { backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  badgeActiveText: { color: colors.white, fontSize: 12, fontWeight: 'bold' },
  
  badgeInactive: { backgroundColor: colors.accentIce, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  badgeInactiveText: { color: colors.primary, fontSize: 12, fontWeight: 'bold' },
});

export default ExploreCoachesScreen;
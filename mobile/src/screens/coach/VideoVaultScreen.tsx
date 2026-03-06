import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { WebView } from 'react-native-webview';
import * as ImagePicker from 'expo-image-picker'; // <-- Brought this back!
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { videoApi } from '../../services/api/videoApi';
import { colors } from '../../constants/colors';
import { theme } from '../../constants/theme';

interface Video {
  id: string;
  title: string;
  url: string;
  category: string;
}

const VideoVaultScreen = () => {
  const coach = useSelector((state: RootState) => state.auth.coach);
  
  // --- REAL UPLOAD STATE ---
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Training 1');
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // List & Edit State
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');

  const loadVideos = async () => {
    if (!coach?.id) return;
    try {
      const data = await videoApi.getCoachVideos(coach.id);
      setVideos(data);
    } catch (error) {
      Alert.alert('Error', 'Could not load your videos.');
    } finally {
      setIsLoadingFeed(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadVideos(); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadVideos();
  };

  // --- NATIVE FILE UPLOAD LOGIC ---
  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permission Denied', 'Need camera roll access to upload videos.');
    
    let result = await ImagePicker.launchImageLibraryAsync({ 
      mediaTypes: ['videos'],
      allowsEditing: true, 
      quality: 1 
    });
    
    if (!result.canceled) {
      setVideoUri(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (!coach?.id || !videoUri || !title) return Alert.alert('Missing Info', 'Select a video and provide a title.');
    setIsUploading(true);
    try {
      await videoApi.uploadVideo(coach.id, title, category, videoUri);
      Alert.alert('Success!', 'Video uploaded securely to Vimeo.');
      setTitle(''); 
      setVideoUri(null); // Clear the selected video
      loadVideos(); // Refresh the feed!
    } catch (error: any) {
      Alert.alert('Upload Failed', error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // --- EDIT & DELETE LOGIC ---
  const handleDelete = (videoId: string) => {
    Alert.alert('Delete Video', 'Are you sure? Your clients will lose access to this.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await videoApi.deleteVideo(videoId);
            setVideos(videos.filter(v => v.id !== videoId)); // Remove from screen
          } catch (error: any) { Alert.alert('Error', error.message); }
      }}
    ]);
  };

  const startEditing = (video: Video) => {
    setEditingId(video.id);
    setEditTitle(video.title);
    setEditCategory(video.category);
  };

  const saveEdit = async (videoId: string) => {
    try {
      await videoApi.updateVideo(videoId, editTitle, editCategory);
      setEditingId(null);
      loadVideos(); // Refresh the list to show new details
    } catch (error: any) { Alert.alert('Error', error.message); }
  };

  // --- UI RENDERERS ---
  const renderHeader = () => (
    <View style={styles.uploadSection}>
      <Text style={styles.sectionTitle}>Upload New Video</Text>
      <View style={styles.card}>
        <Input label="Title" placeholder="e.g. Warmup" value={title} onChangeText={setTitle} />
        <Input label="Category" placeholder="e.g. Training 1" value={category} onChangeText={setCategory} />
        
        {/* REPLACED URL INPUT WITH GALLERY BUTTON */}
        <Button 
          title={videoUri ? "Video Selected - Change" : "Choose Video from Gallery"} 
          variant="outline" 
          onPress={pickVideo} 
          style={{ marginBottom: 15 }} 
        />
        
        {isUploading ? (
          <View style={{ alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ marginTop: 10, color: colors.textLight }}>Compressing & Uploading...</Text>
          </View>
        ) : (
          <Button title="Upload to Vault" onPress={handleUpload} disabled={!videoUri || !title} />
        )}
      </View>
      <Text style={[styles.sectionTitle, { marginTop: 30 }]}>Your Video Vault</Text>
    </View>
  );

  const renderVideoItem = ({ item }: { item: Video }) => {
    const isEditing = editingId === item.id;

    return (
      <View style={styles.card}>
        {/* The Embedded Player so the Coach can preview it */}
        <View style={styles.videoContainer}>
          <WebView source={{ uri: item.url }} style={styles.webview} allowsFullscreenVideo={true} javaScriptEnabled={true} scrollEnabled={false} />
        </View>

        <View style={styles.videoDetails}>
          {isEditing ? (
            <View>
              <Input label="Edit Title" value={editTitle} onChangeText={setEditTitle} />
              <Input label="Edit Category" value={editCategory} onChangeText={setEditCategory} />
              <View style={styles.actionRow}>
                <Button title="Cancel" variant="outline" onPress={() => setEditingId(null)} style={{ flex: 1, marginRight: 5 }} />
                <Button title="Save" onPress={() => saveEdit(item.id)} style={{ flex: 1, marginLeft: 5 }} />
              </View>
            </View>
          ) : (
            <View>
              <View style={styles.titleRow}>
                <Text style={styles.videoTitle}>{item.title}</Text>
                <Text style={styles.badge}>{item.category}</Text>
              </View>
              <View style={styles.actionRow}>
                <TouchableOpacity onPress={() => startEditing(item)} style={styles.actionBtn}>
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (isLoadingFeed) return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <FlatList
      data={videos}
      keyExtractor={(item) => item.id}
      renderItem={renderVideoItem}
      ListHeaderComponent={renderHeader()} // <-- Kept your parenthesis fix!
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    />
  );
};

const styles = StyleSheet.create({
  container: { padding: theme.spacing.lg, backgroundColor: colors.background, paddingBottom: 50 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  uploadSection: { marginBottom: theme.spacing.md },
  sectionTitle: { fontSize: theme.typography.size.xl, fontWeight: 'bold', color: colors.primary, marginBottom: 15 },
  
  card: { backgroundColor: colors.white, borderRadius: theme.borderRadius.lg, marginBottom: theme.spacing.lg, overflow: 'hidden', elevation: 3 },
  videoContainer: { height: 200, width: '100%', backgroundColor: '#000' },
  webview: { flex: 1, backgroundColor: 'transparent' },
  
  videoDetails: { padding: theme.spacing.md },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  videoTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, flex: 1 },
  badge: { backgroundColor: colors.accentIce, color: colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, fontSize: 12, fontWeight: 'bold', overflow: 'hidden' },
  
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  actionBtn: { marginLeft: 20, paddingVertical: 5 },
  editText: { color: colors.primary, fontWeight: 'bold', fontSize: 16 },
  deleteText: { color: 'red', fontWeight: 'bold', fontSize: 16 },
});

export default VideoVaultScreen;
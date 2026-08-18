import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

interface YouTubeVideoPlayerProps {
  youtubeVideoId: string;
}

export const YouTubeVideoPlayer: React.FC<YouTubeVideoPlayerProps> = ({ youtubeVideoId }) => {
  const embedUrl = `https://www.youtube-nocookie.com/embed/${youtubeVideoId}?autoplay=1&controls=1&rel=0&playsinline=1`;

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <iframe
          src={embedUrl}
          style={{ width: '100%', height: '100%', border: 'none' } as any}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </View>
    );
  }

  // Native iOS / Android WebView player
  try {
    const { WebView } = require('react-native-webview');
    return (
      <View style={styles.container}>
        <WebView
          source={{ uri: embedUrl }}
          style={styles.webview}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
          domStorageEnabled
        />
      </View>
    );
  } catch (err) {
    return (
      <View style={styles.container}>
        <View style={styles.fallbackBox} />
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
  fallbackBox: {
    flex: 1,
    backgroundColor: '#161B26',
  },
});

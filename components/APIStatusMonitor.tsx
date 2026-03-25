import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import api from '../utils/api';

export default function APIStatusMonitor() {
  const [status, setStatus] = useState<'checking' | 'up' | 'down'>('checking');
  const [responseTime, setResponseTime] = useState<number | null>(null);

  useEffect(() => {
    checkAPIStatus();
    const interval = setInterval(checkAPIStatus, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const checkAPIStatus = async () => {
    try {
      const startTime = Date.now();
      // Health check
      const response = await api.get('/health', { timeout: 3000 });
      const endTime = Date.now();
      
      if (response.data && response.data.status === 'ok') {
        setStatus('up');
        setResponseTime(endTime - startTime);
      } else {
        setStatus('down');
        setResponseTime(null);
      }
    } catch (error) {
      setStatus('down');
      setResponseTime(null);
    }
  };

  if (status === 'checking') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#999" />
        <Text style={styles.text}>Checking API...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, status === 'up' ? styles.up : styles.down]}>
      <Text style={styles.icon}>{status === 'up' ? '✅' : '❌'}</Text>
      <View>
        <Text style={[styles.text, styles.bold]}>
          API {status === 'up' ? 'Working' : 'Down'}
        </Text>
        {status === 'up' && responseTime !== null && (
          <Text style={styles.subtext}>{responseTime}ms response time</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginVertical: 8,
    alignSelf: 'flex-start',
    gap: 8,
    borderWidth: 1,
    borderColor: '#eee',
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  up: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  down: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  icon: {
    fontSize: 16,
  },
  text: {
    fontSize: 12,
    color: '#333',
  },
  bold: {
    fontWeight: 'bold',
  },
  subtext: {
    fontSize: 10,
    color: '#666',
  },
});

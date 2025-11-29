import { createOrGetConversation, getAllAgents } from '@/lib/appwrite';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface AgentSelectorModalProps {
  visible: boolean;
  onClose: () => void;
}

const AgentSelectorModal: React.FC<AgentSelectorModalProps> = ({ visible, onClose }) => {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadAgents();
    }
  }, [visible]);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const agentList = await getAllAgents();
      setAgents(agentList);
    } catch (error) {
      console.error('Error loading agents:', error);
      Alert.alert('Erreur', 'Impossible de charger la liste des agents');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAgent = async (agent: any) => {
    try {
      const result = await createOrGetConversation(agent.$id);
      
      if (result.success && result.conversation) {
        onClose();
        router.push({
          pathname: '/chat/[id]',
          params: {
            id: result.conversation.$id,
            otherUserId: agent.$id,
          },
        });
      } else {
        Alert.alert('Erreur', 'Impossible de démarrer la conversation');
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
    }
  };

  const renderAgentItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.agentItem}
      onPress={() => handleSelectAgent(item)}
    >
      <Image
        source={{ 
          uri: item.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || 'Agent')}&size=200&background=007AFF&color=fff`
        }}
        style={styles.agentAvatar}
      />
      <View style={styles.agentInfo}>
        <Text style={styles.agentName}>{item.name || 'Agent'}</Text>
        <Text style={styles.agentEmail}>{item.email}</Text>
        {item.phone && (
          <Text style={styles.agentPhone}>{item.phone}</Text>
        )}
        {item.propertyCount && (
          <Text style={styles.propertyCount}>
            {item.propertyCount} propriété{item.propertyCount > 1 ? 's' : ''}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>Aucun agent disponible</Text>
      <Text style={styles.emptySubtitle}>
        Les agents apparaîtront ici quand ils seront disponibles
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nouveau Message</Text>
          <View style={styles.placeholder} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Chargement des agents...</Text>
          </View>
        ) : (
          <FlatList
            data={agents}
            renderItem={renderAgentItem}
            keyExtractor={(item) => item.$id}
            contentContainerStyle={agents.length === 0 ? styles.emptyListContainer : styles.agentsList}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    width: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  agentsList: {
    paddingVertical: 8,
  },
  agentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  agentAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  agentEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  agentPhone: {
    fontSize: 14,
    color: '#888',
  },
  propertyCount: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    marginTop: 2,
  },
  emptyListContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default AgentSelectorModal;
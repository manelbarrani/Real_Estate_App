# 🧪 Guide de Test - Système de Notifications

## Test Manuel Rapide

### 1. Tester l'Écran des Notifications

1. **Accéder à l'écran**
   - Ouvrez l'app
   - Allez dans Profile
   - Cliquez sur "Notifications" dans le menu
   - OU cliquez sur l'icône de cloche en haut à droite

2. **Vérifier l'affichage vide**
   - Si aucune notification: devrait afficher "No Notifications"
   - Message explicatif visible

3. **Créer une notification de test**
   - Utilisez la console Appwrite
   - Ou utilisez le code ci-dessous

### 2. Tester les Préférences

1. **Accéder aux préférences**
   - Depuis l'écran Notifications
   - Cliquez sur "Settings" en haut à droite

2. **Modifier les préférences**
   - Toggle chaque switch
   - Vérifier que les changements sont sauvegardés
   - Rafraîchir l'écran pour vérifier la persistance

### 3. Tester le Badge

1. **Compteur visible**
   - Le badge rouge devrait apparaître sur l'icône de cloche
   - Le nombre devrait correspondre aux notifications non lues

2. **Mise à jour du compteur**
   - Marquer une notification comme lue
   - Le compteur devrait diminuer

## Code de Test

### Créer une Notification de Test

Ajoutez ce code temporairement dans votre app (par exemple dans `profile.tsx`):

```typescript
import { createNotification } from '@/lib/appwrite';
import { useGlobalContext } from '@/lib/global-provider';

// Dans votre composant
const { user } = useGlobalContext();

const createTestNotification = async () => {
  if (!user?.$id) return;
  
  try {
    await createNotification({
      userId: user.$id,
      type: 'message',
      category: 'messages',
      priority: 'normal',
      title: '🧪 Test Notification',
      message: 'Ceci est une notification de test pour vérifier le système',
      actionUrl: '/notifications',
      data: { test: true }
    });
    
    Alert.alert('Success', 'Notification de test créée!');
  } catch (error) {
    Alert.alert('Error', String(error));
  }
};

// Ajouter un bouton
<TouchableOpacity onPress={createTestNotification}>
  <Text>Créer Notification Test</Text>
</TouchableOpacity>
```

### Tester Tous les Types de Notifications

```typescript
const testAllNotificationTypes = async () => {
  if (!user?.$id) return;
  
  const types = [
    {
      type: 'message' as const,
      title: '💬 Nouveau Message',
      message: 'John Doe vous a envoyé un message',
      category: 'messages' as const,
    },
    {
      type: 'booking_request' as const,
      title: '📅 Nouvelle Demande',
      message: 'Sarah veut réserver votre propriété',
      category: 'bookings' as const,
    },
    {
      type: 'booking_confirmed' as const,
      title: '✅ Réservation Confirmée',
      message: 'Votre réservation a été confirmée',
      category: 'bookings' as const,
    },
    {
      type: 'payment_received' as const,
      title: '💰 Paiement Reçu',
      message: 'Vous avez reçu un paiement de 500€',
      category: 'payments' as const,
    },
    {
      type: 'review_received' as const,
      title: '⭐ Nouvel Avis',
      message: 'Vous avez reçu un avis 5 étoiles',
      category: 'reviews' as const,
    },
  ];
  
  for (const notif of types) {
    await createNotification({
      userId: user.$id,
      ...notif,
      priority: 'normal',
    });
    
    // Attendre 500ms entre chaque
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  Alert.alert('Success', `${types.length} notifications créées!`);
};
```

### Tester avec les Helpers

```typescript
import { 
  notifyNewMessage,
  notifyBookingRequest,
  notifyPaymentReceived
} from '@/lib/notification-helpers';

const testHelpers = async () => {
  if (!user?.$id) return;
  
  // Test message
  await notifyNewMessage({
    receiverId: user.$id,
    senderName: 'Test User',
    messagePreview: 'Hello from test!',
    conversationId: 'test_conv_id'
  });
  
  // Test booking
  await notifyBookingRequest({
    agentId: user.$id,
    guestName: 'Test Guest',
    propertyName: 'Beautiful Villa',
    bookingId: 'test_booking_id',
    checkInDate: new Date().toISOString(),
    checkOutDate: new Date(Date.now() + 86400000).toISOString()
  });
  
  Alert.alert('Success', 'Helpers testés!');
};
```

## Checklist de Test

### Fonctionnalités de Base
- [ ] Affichage des notifications
- [ ] Badge de compteur visible
- [ ] Clic sur notification redirige
- [ ] Marquer comme lu fonctionne
- [ ] Marquer tout comme lu fonctionne
- [ ] Supprimer une notification fonctionne
- [ ] Supprimer toutes les lues fonctionne
- [ ] Pull to refresh fonctionne

### Filtres
- [ ] Filtre "Unread only" fonctionne
- [ ] Filtres par catégorie fonctionnent
- [ ] Combinaison de filtres fonctionne

### Préférences
- [ ] Écran de préférences s'ouvre
- [ ] Toutes les préférences sont listées
- [ ] Switches fonctionnent
- [ ] Changements sont sauvegardés
- [ ] Changements persistent après redémarrage

### Temps Réel
- [ ] Nouvelles notifications apparaissent instantanément
- [ ] Compteur se met à jour automatiquement
- [ ] Auto-refresh fonctionne (30 secondes)

### UI/UX
- [ ] Icônes appropriées pour chaque type
- [ ] Couleurs de priorité correctes
- [ ] Indicateur "non lu" visible
- [ ] Horodatage relatif correct
- [ ] Animations fluides
- [ ] Design cohérent avec l'app

### Cas d'Erreur
- [ ] Gestion de l'absence de connexion
- [ ] Message d'erreur approprié
- [ ] Retry automatique si échec

## Résultats Attendus

### Écran des Notifications
- Liste des notifications par ordre chronologique décroissant
- Notifications non lues avec fond bleu clair
- Badge rouge sur les non lues
- Temps relatif ("il y a 2 heures")
- Icônes colorées selon le type

### Écran des Préférences
- Toutes les options listées par catégorie
- Switches fonctionnels
- Feedback visuel sur les changements
- Message informatif en bas

### Compteur de Badge
- Badge rouge avec chiffre blanc
- Disparaît quand compteur = 0
- Affiche "99+" si > 99
- Visible dans Profile et (optionnel) Tab Bar

## Problèmes Connus

### Notifications ne s'affichent pas
**Cause**: Collection IDs incorrects
**Solution**: Vérifier `.env`

### Compteur ne se met pas à jour
**Cause**: Realtime pas activé
**Solution**: Vérifier console Appwrite

### Préférences ne se sauvent pas
**Cause**: Permissions manquantes
**Solution**: Vérifier permissions de la collection

## Prochaines Étapes

Après validation des tests:

1. ✅ Intégrer dans le système de messages
2. ✅ Intégrer dans le système de réservations
3. ✅ Intégrer dans le système de paiements
4. ✅ Intégrer dans le système d'avis
5. ✅ Configurer les push notifications natives (Expo)
6. ✅ Tester avec vrais utilisateurs

---

**Bon test! 🧪**

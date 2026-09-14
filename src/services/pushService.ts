const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000/api`;

function getAuthHeaders() {
  const token = localStorage.getItem('vinz_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

const publicVapidKey = 'BIwVNGO_jdFV2MHVa2T0itv_HYToG-Bx8-SdS9uesJb7ZZ7lyumWjLIT7GIXJsQ4PFw2xKvMWHru8evmPUkAIiE';

// Utilidad para convertir base64 VAPID a Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const pushService = {
  async subscribe() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push Notifications no están soportadas en este navegador.');
      return false;
    }

    try {
      // 1. Pedir permiso
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('Permiso para notificaciones denegado.');
        return false;
      }

      // 2. Obtener Service Worker Registration
      const registration = await navigator.serviceWorker.ready;

      // 3. Suscribirse al PushManager
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
      });

      // 4. Enviar suscripción al backend
      const subscriptionData = subscription.toJSON();
      
      await fetch(`${API_URL}/push/subscribe/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          endpoint: subscriptionData.endpoint,
          keys: subscriptionData.keys
        })
      });

      console.log('Suscripción Push exitosa.');
      return true;

    } catch (error) {
      console.error('Error al suscribirse a Push Notifications:', error);
      return false;
    }
  },

  async unsubscribe() {
    if (!('serviceWorker' in navigator)) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Enviar petición al backend para eliminar
        await fetch(`${API_URL}/push/subscribe/`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
          body: JSON.stringify({ endpoint: subscription.endpoint })
        });
        // Desuscribir en el navegador
        await subscription.unsubscribe();
        console.log('Desuscripción Push exitosa.');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al desuscribirse:', error);
      return false;
    }
  }
};

import { Platform } from 'react-native'
import { supabase } from '../backend/supabase'

const VAPID_PUBLIC_KEY = process.env.EXPO_PUBLIC_VAPID_PUBLIC_KEY || process.env.REACT_APP_VAPID_PUBLIC_KEY

export async function registerWebPush() {
  if (Platform.OS !== 'web') return
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !VAPID_PUBLIC_KEY) return

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return

  // Service worker mora biti v istem scope-u kot app na GH Pages (/Kofi/)
  const registration = await navigator.serviceWorker.register('/Kofi/sw.js', { scope: '/Kofi/' })

  let subscription = await registration.pushManager.getSubscription()
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    })
  }

  const { endpoint, keys } = subscription.toJSON()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Shrani/upsert naročnino
  await supabase.from('push_subscriptions').upsert({
    user_id: user.id,
    endpoint,
    p256dh: keys.p256dh,
    auth: keys.auth,
    user_agent: navigator.userAgent
  }, { onConflict: 'endpoint' })
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
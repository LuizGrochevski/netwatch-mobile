import { useState, useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import LoginScreen from '../src/screens/LoginScreen'
import HistoryScreen from '../src/screens/HistoryScreen'
import { getToken, removeToken, saveToken } from '../src/storage/token'

export default function App() {
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getToken()
      .then((t) => {
        if (t) setToken(t)
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleLoginSuccess(newToken: string) {
    await saveToken(newToken)
    setToken(newToken)
  }

  async function handleLogout() {
    await removeToken()
    setToken(null)
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0e0f' }}>
        <ActivityIndicator size="large" color="#3ddc84" />
      </View>
    )
  }

  if (!token) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <HistoryScreen token={token} onLogout={handleLogout} />
    </SafeAreaView>
  )
}

import { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import LoginScreen from '../src/screens/LoginScreen'
import HistoryScreen from '../src/screens/HistoryScreen'
import { removeToken } from '../src/storage/token'

export default function App() {
  const [token, setToken] = useState<string | null>(null)

  async function handleLogout() {
    await removeToken()
    setToken(null)
  }

  if (!token) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <LoginScreen onLoginSuccess={setToken} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <HistoryScreen token={token} onLogout={handleLogout} />
    </SafeAreaView>
  )
}
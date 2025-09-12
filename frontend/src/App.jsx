import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkHealth()
  }, [])

  const checkHealth = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/health')
      setHealth(response.data)
    } catch (error) {
      setHealth({ status: 'ERROR', error: error.message })
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="app">
      <h1>Social Media Monitor 🚀</h1>
      <div className="status">
        <h2>Status: {health.status}</h2>
        <p>Service: {health.service}</p>
        <p>Time: {health.timestamp}</p>
        {health.error && <p className="error">Error: {health.error}</p>}
      </div>
    </div>
  )
}

export default App
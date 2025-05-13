import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import ChatPage from './pages/chatbot/component/chatPage'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <ChatPage />
    </>
  )
}

export default App

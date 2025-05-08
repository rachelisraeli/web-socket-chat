import './App.css'
import Chat from './components/Chat'
import { SocketProvider } from './context/SocketContext';

function App() {

  return (
    <>
      <SocketProvider>
        <Chat></Chat>
      </SocketProvider>
    </>
  )
}

export default App

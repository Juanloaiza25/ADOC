import { BrowserRouter } from 'react-router-dom'
import { QueryProvider } from './providers/QueryProvider'
import { AuthProvider } from './providers/AuthProvider'
import { ThemeProvider } from './providers/ThemeProvider'
import { AppRouter } from './router/AppRouter'

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <ThemeProvider>
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </QueryProvider>
  )
}

export default App

import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { store } from './store'
import { loadCartFromStorage } from './store/cartSlice'
import { loadCart } from './services/cartStorage'
import './index.css'
import App from './containers/App'

const queryClient = new QueryClient();

// Загрузка корзины из локального хранилища при инициализации приложения
const initializeCart = async () => {
  const savedCart = await loadCart();
  if (savedCart) {
    store.dispatch(loadCartFromStorage(savedCart));
  }
};

initializeCart();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </QueryClientProvider>
  </StrictMode>,
)

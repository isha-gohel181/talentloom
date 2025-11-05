import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './redux/store/store'
import { getCurrentUser } from './redux/slice/user.slice'
import './index.css'
import App from './App.jsx'

// Check auth status on app load
const token = localStorage.getItem("accessToken");
if (token) {
  store.dispatch(getCurrentUser());
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
  </StrictMode>,
)

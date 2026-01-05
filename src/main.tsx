import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App' // Vite resolves .tsx automatically
// import { registerSW } from 'virtual:pwa-register'

// const updateSW = registerSW({
//     onNeedRefresh() {
//         // In production we might want a Toast instead of confirm
//         // For now keeping simple logic but type-safe
//         if (confirm('Nova versão disponível! Atualizar?')) {
//             updateSW(true);
//         }
//     },
// })

// Type assertion for root element
const rootElement = document.getElementById('root');
if (rootElement) {
    createRoot(rootElement).render(
        <StrictMode>
            <App />
        </StrictMode>,
    )
}

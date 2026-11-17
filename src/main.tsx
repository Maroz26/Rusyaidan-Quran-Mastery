import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './firebase'
import App from './App.tsx'
import { initializeQuranData } from './services/quranService'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element was not found.')

const root = createRoot(rootElement)
root.render(
  <div className="flex min-h-screen items-center justify-center text-emerald-200">
    Memuat data ayat Al-Qur&apos;an...
  </div>,
)

initializeQuranData()
  .then(() => {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  })
  .catch((error: unknown) => {
    console.error('Failed to initialize Quran text dataset:', error)
    root.render(
      <div role="alert" className="mx-auto mt-12 max-w-xl rounded-2xl border border-rose-800 bg-[#0C2B21] p-6 text-center text-rose-100">
        Gagal memuat data ayat Al-Qur&apos;an. Periksa koneksi lalu muat ulang halaman.
      </div>,
    )
  })

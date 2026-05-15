import React from 'react'
import ReactDOM from 'react-dom/client'
import ClassicWords from './ClassicWords'
import { useRegisterSW } from 'virtual:pwa-register/react'

function AppWithUpdate() {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW({
    onRegistered(r) {
      // Vérifier les mises à jour toutes les 60 secondes
      r && setInterval(() => r.update(), 60 * 1000)
    }
  })

  return (
    <>
      <ClassicWords />
      {needRefresh && (
        <div
          onClick={() => updateServiceWorker(true)}
          style={{
            position: 'fixed',
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 99999,
            background: 'linear-gradient(135deg,#1565C0,#0D47A1)',
            color: '#FFF',
            padding: '14px 24px',
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: '700',
            fontFamily: "'Helvetica Neue',Arial,sans-serif",
            boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
            cursor: 'pointer',
            textAlign: 'center',
            border: '2px solid rgba(255,255,255,0.25)',
            maxWidth: '280px',
            width: '80vw',
            touchAction: 'manipulation',
            userSelect: 'none',
          }}
        >
          🔄 Mise à jour disponible
          <div style={{ fontSize: '11px', fontWeight: '400', opacity: 0.85, marginTop: '3px' }}>
            Touchez ici pour mettre à jour
          </div>
        </div>
      )}
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppWithUpdate />
  </React.StrictMode>
)

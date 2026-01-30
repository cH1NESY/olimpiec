import { useEffect } from 'react'
import { isTelegramWebApp, initTelegramWebApp } from '../../utils/telegram'
import './TelegramWrapper.css'

/**
 * Wrapper component for Telegram Web App
 * Handles Telegram-specific UI adaptations
 */
const TelegramWrapper = ({ children }) => {
  useEffect(() => {
    if (isTelegramWebApp()) {
      initTelegramWebApp()
    }
  }, [])

  return (
    <div className={`telegram-wrapper ${isTelegramWebApp() ? 'telegram-active' : ''}`}>
      {children}
    </div>
  )
}

export default TelegramWrapper

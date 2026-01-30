/**
 * Telegram Web App utilities
 */

/**
 * Check if app is running in Telegram
 */
export const isTelegramWebApp = () => {
  return typeof window !== 'undefined' && window.Telegram?.WebApp !== undefined
}

/**
 * Get Telegram WebApp instance
 */
export const getTelegramWebApp = () => {
  if (isTelegramWebApp()) {
    return window.Telegram.WebApp
  }
  return null
}

/**
 * Initialize Telegram Web App
 */
export const initTelegramWebApp = () => {
  const webApp = getTelegramWebApp()
  if (!webApp) {
    return null
  }

  // Expand the app to full height
  webApp.expand()
  
  // Enable closing confirmation
  webApp.enableClosingConfirmation()
  
  // Set theme colors
  const colorScheme = webApp.colorScheme || 'light'
  const themeParams = webApp.themeParams || {}
  
  // Apply theme colors to CSS variables
  if (themeParams.bg_color) {
    document.documentElement.style.setProperty('--tg-theme-bg-color', themeParams.bg_color)
  }
  if (themeParams.text_color) {
    document.documentElement.style.setProperty('--tg-theme-text-color', themeParams.text_color)
  }
  if (themeParams.hint_color) {
    document.documentElement.style.setProperty('--tg-theme-hint-color', themeParams.hint_color)
  }
  if (themeParams.link_color) {
    document.documentElement.style.setProperty('--tg-theme-link-color', themeParams.link_color)
  }
  if (themeParams.button_color) {
    document.documentElement.style.setProperty('--tg-theme-button-color', themeParams.button_color)
  }
  if (themeParams.button_text_color) {
    document.documentElement.style.setProperty('--tg-theme-button-text-color', themeParams.button_text_color)
  }

  // Set viewport height for mobile
  const vh = window.innerHeight * 0.01
  document.documentElement.style.setProperty('--vh', `${vh}px`)

  // Listen for viewport changes
  window.addEventListener('resize', () => {
    const vh = window.innerHeight * 0.01
    document.documentElement.style.setProperty('--vh', `${vh}px`)
  })

  return webApp
}

/**
 * Get Telegram initData for authentication
 */
export const getTelegramInitData = () => {
  const webApp = getTelegramWebApp()
  if (!webApp) {
    return null
  }
  return webApp.initData
}

/**
 * Get Telegram user data
 */
export const getTelegramUser = () => {
  const webApp = getTelegramWebApp()
  if (!webApp) {
    return null
  }
  return webApp.initDataUnsafe?.user || null
}

/**
 * Show Telegram main button
 */
export const showMainButton = (text, onClick) => {
  const webApp = getTelegramWebApp()
  if (!webApp) return

  webApp.MainButton.setText(text)
  webApp.MainButton.onClick(onClick)
  webApp.MainButton.show()
}

/**
 * Hide Telegram main button
 */
export const hideMainButton = () => {
  const webApp = getTelegramWebApp()
  if (!webApp) return

  webApp.MainButton.hide()
}

/**
 * Show Telegram back button
 */
export const showBackButton = (onClick) => {
  const webApp = getTelegramWebApp()
  if (!webApp) return

  webApp.BackButton.onClick(onClick)
  webApp.BackButton.show()
}

/**
 * Hide Telegram back button
 */
export const hideBackButton = () => {
  const webApp = getTelegramWebApp()
  if (!webApp) return

  webApp.BackButton.hide()
}

/**
 * Show Telegram alert
 */
export const showAlert = (message) => {
  const webApp = getTelegramWebApp()
  if (!webApp) {
    alert(message)
    return
  }
  webApp.showAlert(message)
}

/**
 * Show Telegram confirm
 */
export const showConfirm = (message) => {
  const webApp = getTelegramWebApp()
  if (!webApp) {
    return Promise.resolve(confirm(message))
  }
  return webApp.showConfirm(message)
}

/**
 * Close Telegram Web App
 */
export const closeTelegramWebApp = () => {
  const webApp = getTelegramWebApp()
  if (!webApp) return

  webApp.close()
}

/**
 * Haptic feedback
 */
export const hapticFeedback = (type = 'impact', style = 'medium') => {
  const webApp = getTelegramWebApp()
  if (!webApp) return

  if (type === 'impact') {
    webApp.HapticFeedback.impactOccurred(style)
  } else if (type === 'notification') {
    webApp.HapticFeedback.notificationOccurred(style)
  } else if (type === 'selection') {
    webApp.HapticFeedback.selectionChanged()
  }
}

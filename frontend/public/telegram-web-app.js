// Telegram Web App script placeholder
// This will be loaded from Telegram CDN when running in Telegram
// For development, we'll create a mock implementation

if (typeof window !== 'undefined' && !window.Telegram) {
  // Mock Telegram WebApp for development
  window.Telegram = {
    WebApp: {
      initData: '',
      initDataUnsafe: {
        user: null
      },
      version: '6.0',
      platform: 'web',
      colorScheme: 'light',
      themeParams: {},
      isExpanded: true,
      viewportHeight: window.innerHeight,
      viewportStableHeight: window.innerHeight,
      headerColor: '#ffffff',
      backgroundColor: '#ffffff',
      isClosingConfirmationEnabled: false,
      BackButton: {
        isVisible: false,
        onClick: function(callback) { this.onClickCallback = callback; },
        offClick: function() { this.onClickCallback = null; },
        show: function() { this.isVisible = true; },
        hide: function() { this.isVisible = false; }
      },
      MainButton: {
        text: '',
        color: '',
        textColor: '',
        isVisible: false,
        isActive: true,
        isProgressVisible: false,
        setText: function(text) { this.text = text; },
        onClick: function(callback) { this.onClickCallback = callback; },
        offClick: function() { this.onClickCallback = null; },
        show: function() { this.isVisible = true; },
        hide: function() { this.isVisible = false; },
        enable: function() { this.isActive = true; },
        disable: function() { this.isActive = false; },
        showProgress: function() { this.isProgressVisible = true; },
        hideProgress: function() { this.isProgressVisible = false; }
      },
      HapticFeedback: {
        impactOccurred: function(style) { console.log('Haptic feedback:', style); },
        notificationOccurred: function(type) { console.log('Haptic notification:', type); },
        selectionChanged: function() { console.log('Haptic selection changed'); }
      },
      expand: function() { this.isExpanded = true; },
      close: function() { console.log('Close Telegram WebApp'); },
      ready: function() { console.log('Telegram WebApp ready'); },
      sendData: function(data) { console.log('Send data:', data); },
      openLink: function(url) { window.open(url, '_blank'); },
      openTelegramLink: function(url) { console.log('Open Telegram link:', url); },
      openInvoice: function(url, callback) { console.log('Open invoice:', url); },
      showPopup: function(params, callback) { 
        if (params.message) alert(params.message);
        if (callback) callback(true);
      },
      showAlert: function(message, callback) { 
        alert(message);
        if (callback) callback();
      },
      showConfirm: function(message, callback) { 
        const result = confirm(message);
        if (callback) callback(result);
        return Promise.resolve(result);
      },
      showScanQrPopup: function(params, callback) { console.log('Show QR popup'); },
      closeScanQrPopup: function() { console.log('Close QR popup'); },
      readTextFromClipboard: function(callback) { 
        navigator.clipboard.readText().then(callback).catch(() => callback(''));
      },
      requestWriteAccess: function(callback) { 
        if (callback) callback(true);
        return Promise.resolve(true);
      },
      requestContact: function(callback) { 
        console.log('Request contact');
        if (callback) callback({ contact: null });
      },
      enableClosingConfirmation: function() { this.isClosingConfirmationEnabled = true; },
      disableClosingConfirmation: function() { this.isClosingConfirmationEnabled = false; },
      onEvent: function(eventType, eventHandler) { 
        if (!this.eventHandlers) this.eventHandlers = {};
        if (!this.eventHandlers[eventType]) this.eventHandlers[eventType] = [];
        this.eventHandlers[eventType].push(eventHandler);
      },
      offEvent: function(eventType, eventHandler) {
        if (this.eventHandlers && this.eventHandlers[eventType]) {
          this.eventHandlers[eventType] = this.eventHandlers[eventType].filter(h => h !== eventHandler);
        }
      },
      setHeaderColor: function(color) { this.headerColor = color; },
      setBackgroundColor: function(color) { this.backgroundColor = color; }
    }
  };
  
  // Initialize mock WebApp
  if (window.Telegram.WebApp.ready) {
    window.Telegram.WebApp.ready();
  }
}

export default {
  // Success state
  success: {
    title: 'E-Mail verifiziert!',
    message:
      'Ihre E-Mail wurde erfolgreich verifiziert. Sie können sich jetzt in Ihr Konto einloggen.',
    goToLogin: 'Zum Login',
  },
  // Error state
  error: {
    title: 'Verifizierung fehlgeschlagen',
    tryAgain: 'Erneut versuchen',
    backToLogin: 'Zurück zum Login',
    errorTitle: 'Fehler',
  },
  // API Error messages
  apiErrors: {
    UserEmailInvalidVerificationTokenException:
      'Ungültiger Verifizierungstoken. Bitte fordern Sie einen neuen Verifizierungslink an.',
    invalidLink:
      'Ungültiger Verifizierungslink. Bitte fordern Sie einen neuen an.',
    unexpectedError: 'Ein unerwarteter Fehler ist aufgetreten',
  },
};

export default {
  title: 'Benutzereinführungen',
  addNew: {
    label: 'Benutzername oder E-Mail',
    button: 'Hinzufügen',
  },
  existingIntroductions: 'Benutzer mit Zugang',
  noIntroductions: 'Es wurden noch keine Einführungen gegeben',
  introducedBy: 'Eingeführt von {{tutor}}',
  unknown: 'Unbekannt',
  error: {
    emptyIdentifier: {
      title: 'Kein Benutzer angegeben',
      description:
        'Bitte geben Sie einen Benutzernamen oder eine E-Mail ein, um eine Einführung hinzuzufügen',
    },
    addFailed: {
      title: 'Fehler beim Hinzufügen der Einführung',
      description:
        'Beim Hinzufügen der Einführung ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
    },
  },
  success: {
    title: 'Einführung hinzugefügt',
    description: 'Einführung für {{user}} erfolgreich hinzugefügt',
  },
  pagination: {
    showing: 'Zeige {{start}} bis {{end}} von {{total}} Einführungen',
    previous: 'Zurück',
    next: 'Weiter',
  },
};

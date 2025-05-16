#include "persistence.hpp"

PersistSettings<PersistenceData> Settings(PersistenceData::version);

void Persistence::setup()
{
    Settings.Begin();

    if (!Settings.Valid())
    {
        Serial.println("[Persistence] Settings are invalid, resetting to default.");
        Settings.ResetToDefault();
    }

    strncpy(Settings.Config.api.hostname, SERVER_HOSTNAME, sizeof(Settings.Config.api.hostname) - 1);
    Settings.Config.api.hostname[sizeof(Settings.Config.api.hostname) - 1] = '\0';
    Settings.Config.api.port = SERVER_PORT;
    Settings.Write();
}

PersistSettings<PersistenceData> Persistence::getSettings()
{
    return Settings;
}

void Persistence::saveSettings(PersistSettings<PersistenceData> settings)
{
    Settings = settings;
    Settings.Write();
}

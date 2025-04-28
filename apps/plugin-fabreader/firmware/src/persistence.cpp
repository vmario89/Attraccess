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

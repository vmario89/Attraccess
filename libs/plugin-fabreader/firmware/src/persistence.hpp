#pragma once

#include <Arduino.h>
#include <PersistSettings.h>

#include "configuration.hpp"

struct ApiConfig
{
    char hostname[32] = SERVER_HOSTNAME;
    uint16_t port = SERVER_PORT;
    bool has_auth = false;

    // reader id
    uint32_t readerId = 0;

    // api key
    char apiKey[17] = "0000000000000000";
};

struct PersistenceData
{
    // version
    static const uint8_t version = 2;

    // api server
    ApiConfig api = ApiConfig();
};

class Persistence
{
public:
    static void setup();

    static PersistSettings<PersistenceData> getSettings();

    static void saveSettings(PersistSettings<PersistenceData> settings);
};

#pragma once

#include <Client.h>
#include <PicoWebsocket.h>
#include "persistence.hpp"
#include <ArduinoJson.h>

#define API_WS_PATH "/api/fabreader/websocket"

class API
{
public:
    API(Client &client) : websocket(client, API_WS_PATH), client(client) {}
    ~API() {}

    void setup();
    void loop();

    void sendNFCTapped(uint8_t *uid, uint8_t uidLength);

private:
    PicoWebsocket::Client websocket;
    Client &client;

    bool isConnected();
    void processData();
    bool checkTCPConnection();

    bool is_connected = false;
    bool is_authenticated = false;

    unsigned long registration_sent_at = 0;
    unsigned long authentication_sent_at = 0;

    void sendRegistrationRequest();
    void sendAuthenticationRequest();

    bool isRegistered();
    bool isAuthenticated();

    void onRegistrationData(JsonObject data);
    void onDisplayText(JsonObject data);
    void onUnauthorized(JsonObject data);
};
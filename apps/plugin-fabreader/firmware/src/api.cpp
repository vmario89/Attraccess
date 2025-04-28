#include "api.hpp"

void API::setup()
{
    Serial.println("[API] Setting up...");

    Serial.println("[API] Setup complete.");
}

bool API::checkTCPConnection()
{
    int connectStatus = this->client.connect(
        Persistence::getSettings().Config.api.hostname,
        Persistence::getSettings().Config.api.port);

    if (connectStatus == 1)
    {
        return true;
    }

    Serial.print("[API] Failed to establish TCP connection. Status: ");
    Serial.print(connectStatus);
    Serial.print(" (");
    switch (connectStatus)
    {
    case 0:
        Serial.print("FAILED");
        break;
    case -1:
        Serial.print("TIMED_OUT");
        break;
    case -2:
        Serial.print("INVALID_SERVER");
        break;
    case -3:
        Serial.print("TRUNCATED");
        break;
    case -4:
        Serial.print("INVALID_RESPONSE");
        break;
    case -5:
        Serial.print("DOMAIN_NOT_FOUND");
        break;
    default:
        Serial.print("UNKNOWN_ERROR");
        break;
    }
    Serial.println(")");
    return false;
}

bool API::isConnected()
{
    bool was_connected = this->is_connected;

    this->is_connected = this->websocket.connected();

    if (was_connected != this->is_connected)
    {
        if (!this->is_connected)
        {
            Serial.println("[API] Socket not connected to server: " + String(Persistence::getSettings().Config.api.hostname) + ":" + String(Persistence::getSettings().Config.api.port) + API_WS_PATH);
        }

        if (this->is_connected)
        {
            Serial.println("[API] Socket connected to server: " + String(Persistence::getSettings().Config.api.hostname) + ":" + String(Persistence::getSettings().Config.api.port) + API_WS_PATH);
        }
    }

    if (this->is_connected)
    {
        return true;
    }

    this->is_authenticated = false;
    this->authentication_sent_at = 0;
    this->registration_sent_at = 0;

    Serial.println("[API] Checking TCP connection...");
    bool tcp_connected = this->checkTCPConnection();

    if (!tcp_connected)
    {
        return false;
    }

    Serial.println("[API] Connecting to WebSocket...");
    this->websocket.protocol = "ws";
    this->is_connected = this->websocket.connect(
        Persistence::getSettings().Config.api.hostname,
        Persistence::getSettings().Config.api.port);

    if (this->is_connected)
    {
        Serial.println("[API] WS connection to " + String(Persistence::getSettings().Config.api.hostname) + ":" + String(Persistence::getSettings().Config.api.port) + " established");
    }

    return this->is_connected;
}

void API::onRegistrationData(JsonObject data)
{
    Serial.println("[API] Received registration response.");

    // Extract and save registration info
    if (data.containsKey("payload"))
    {
        auto payload = data["payload"].as<JsonObject>();
        if (payload.containsKey("id") && payload.containsKey("token"))
        {
            uint32_t readerId = payload["id"].as<uint32_t>();
            String apiKey = payload["token"].as<String>();

            // Save to persistence
            PersistSettings<PersistenceData> settings = Persistence::getSettings();
            settings.Config.api.readerId = readerId;
            strncpy(settings.Config.api.apiKey, apiKey.c_str(), sizeof(settings.Config.api.apiKey) - 1);
            settings.Config.api.apiKey[sizeof(settings.Config.api.apiKey) - 1] = '\0'; // Ensure null termination
            settings.Config.api.has_auth = true;
            Persistence::saveSettings(settings);

            this->is_authenticated = true;

            Serial.print("[API] Reader registered with ID: ");
            Serial.print(readerId);
            Serial.print(" and token: ");
            Serial.println(apiKey);
        }
    }
}

void API::onDisplayText(JsonObject data)
{
    Serial.println("[API] DISPLAY_TEXT: " + data["payload"]["message"].as<String>());
}

void API::onUnauthorized(JsonObject data)
{
    Serial.println("[API] UNAUTHORIZED: " + data["payload"]["message"].as<String>());
    this->is_authenticated = false;
    this->authentication_sent_at = 0;
    this->registration_sent_at = 0;
    PersistSettings<PersistenceData> settings = Persistence::getSettings();
    settings.Config.api.has_auth = false;
    Persistence::saveSettings(settings);
}

void API::processData()
{
    if (!this->websocket.available())
    {
        return;
    }

    uint8_t buffer[128];
    const auto bytes_read = this->websocket.read(buffer, 128);
    Serial.print("[API] Received data: ");
    Serial.write(buffer, bytes_read);
    Serial.println();
    if (this->authentication_sent_at != 0)
    {
        this->is_authenticated = true;
        Serial.println("[API] Authentication successful.");
    }

    // parse json
    JsonDocument doc;
    deserializeJson(doc, buffer, bytes_read);

    auto data = doc["data"].as<JsonObject>();
    auto eventType = data["type"].as<String>();

    if (eventType == "REGISTER")
    {
        this->onRegistrationData(data);
    }
    else if (eventType == "UNAUTHORIZED")
    {
        this->onUnauthorized(data);
    }
    else if (eventType == "DISPLAY_TEXT")
    {
        this->onDisplayText(data);
    }
}

bool API::isRegistered()
{
    return (Persistence::getSettings().Config.api.has_auth);
}

void API::sendRegistrationRequest()
{
    // only send registration once per minute
    if (this->registration_sent_at != 0 && millis() - this->registration_sent_at < (1000 * 10))
    {
        return;
    }

    Serial.println("[API] Registering reader...");

    const char *registerMessage = "{\"event\": \"EVENT\", \"data\": {\"type\": \"REGISTER\"}}";
    this->websocket.write((uint8_t *)registerMessage, strlen(registerMessage));
    this->websocket.flush();

    this->registration_sent_at = millis();

    // check write error / status
    auto writeStatus = this->websocket.getWriteError();
    if (writeStatus != 0)
    {
        Serial.print("[API] Failed to send registration request. Error: ");
        Serial.println(writeStatus);
        return;
    }

    Serial.println("[API] Registration request sent.");
}

void API::sendAuthenticationRequest()
{
    // only send authentication once per minute
    if (this->authentication_sent_at != 0 && millis() - this->authentication_sent_at < (1000 * 10))
    {
        return;
    }

    Serial.println("[API] Sending authentication request...");

    JsonDocument event;
    event["event"] = "EVENT";
    event["data"]["type"] = "AUTHENTICATE";
    event["data"]["payload"]["id"] = Persistence::getSettings().Config.api.readerId;
    event["data"]["payload"]["token"] = Persistence::getSettings().Config.api.apiKey;

    String json;
    serializeJson(event, json);

    this->websocket.write((uint8_t *)json.c_str(), json.length());
    this->websocket.flush();

    this->authentication_sent_at = millis();
}

void API::sendNFCTapped(uint8_t *uid, uint8_t uidLength)
{
    Serial.println("[API] Sending NFC tapped event...");

    JsonDocument event;
    event["event"] = "EVENT";
    event["data"]["type"] = "NFC_TAP";
    event["data"]["payload"]["cardUID"] = uid;

    String json;
    serializeJson(event, json);

    this->websocket.write((uint8_t *)json.c_str(), json.length());
    this->websocket.flush();
}

void API::loop()
{
    if (!isConnected())
    {
        return;
    }

    if (!this->isRegistered())
    {
        this->sendRegistrationRequest();
    }
    else if (!this->is_authenticated)
    {
        this->sendAuthenticationRequest();
    }

    this->processData();
}
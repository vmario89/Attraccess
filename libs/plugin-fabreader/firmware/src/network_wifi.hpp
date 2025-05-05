#pragma once

#include "network_interface.hpp"

#include <WiFi.h>

#include "configuration.hpp"

class NetworkWifi : public NetworkInterface
{
public:
    void setup() override;
    bool isHealthy() override;
    void loop() override;
    IPAddress getCurrentIp() override;
    void end() override;

    WiFiClient &getClient() override;

private:
    WiFiClient client;
};
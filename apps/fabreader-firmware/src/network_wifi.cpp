#include "network_wifi.hpp"

void NetworkWifi::setup()
{
    WiFi.disconnect();
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
}

bool NetworkWifi::isHealthy()
{
    return WiFi.status() == WL_CONNECTED;
}

void NetworkWifi::loop()
{
}

IPAddress NetworkWifi::getCurrentIp()
{
    return WiFi.localIP();
}

void NetworkWifi::end()
{
    WiFi.disconnect();
}

WiFiClient &NetworkWifi::getClient()
{
    return this->client;
}
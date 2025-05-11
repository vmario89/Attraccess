#include <Arduino.h>
#include "network.hpp"

Network::Network(Display *display)
{
    this->display = display;
    this->_is_healthy = false;
    this->lastHealthCheck = 0;
}

Network::~Network()
{
    this->interface.end();
}

void Network::setup()
{
    Serial.println("Setting up server connection interface...");
    this->interface.setup();

    Serial.println("Server connection interface setup done. Health checks and interface loop handled in main loop().");
    // Perform an initial health check immediately in setup
    this->_is_healthy = this->interface.isHealthy();
    if (this->_is_healthy)
    {
        Serial.println("Initial connection check: OK. IP: " + this->interface.getCurrentIp().toString());
    }
    else
    {
        Serial.println("Initial connection check: Failed.");
    }
    this->lastHealthCheck = millis(); // Set time for next check
}

void Network::loop()
{
    this->interface.loop();

    // Perform periodic health checks using millis()
    unsigned long currentMillis = millis();
    if (currentMillis - this->lastHealthCheck >= HEALTH_CHECK_INTERVAL_MS)
    {
        this->lastHealthCheck = currentMillis;
        bool is_currently_healthy = this->interface.isHealthy();

        IPAddress ip = this->interface.getCurrentIp();
        this->display->set_ip_address(ip);

        if (is_currently_healthy != this->_is_healthy)
        {
            if (is_currently_healthy)
            {
                Serial.println("[Network] Connection established. IP: " + ip.toString());
            }
            else // Connection lost
            {
                Serial.println("[Network] Connection lost.");
            }
            this->_is_healthy = is_currently_healthy; // Update status

            this->display->set_network_connected(is_currently_healthy);
        }
    }
}

bool Network::isHealthy()
{
    return this->_is_healthy;
}
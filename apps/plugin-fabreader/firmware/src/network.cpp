#include <Arduino.h>
#include "network.hpp"

Network::Network()
{
    // Constructor remains mostly empty or for other initializations
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

        if (is_currently_healthy != this->_is_healthy)
        {
            if (is_currently_healthy)
            {
                Serial.println("[Health Check] Connection established. IP: " + this->interface.getCurrentIp().toString());
            }
            else // Connection lost
            {
                Serial.println("[Health Check] Connection lost.");
            }
            this->_is_healthy = is_currently_healthy; // Update status
        }
        // Optional: Log if still unhealthy
        // else if (!is_currently_healthy) {
        //    Serial.println("[Health Check] Still disconnected.");
        // }
    }
}

// Added public getter for health status
bool Network::isHealthy()
{
    // Optionally, could perform a quick check here instead of relying solely on the timed check
    // return this->interface.isHealthy();
    // For now, just return the status updated by the loop's periodic check
    return this->_is_healthy;
}

// Removed task handler methods
// void Network::health_check_task_handler()
// {
//     ...
// }

// void Network::interface_loop_task_handler()
// {
//     ...
// }
#pragma once

#include "network_interface.hpp"
#include <Arduino.h>
#include "board_config.h"
#include "display.hpp"

#ifdef NETWORK_ETHERNET
#ifdef NETWORK_WIFI
#error "Only one network connection type can be defined"
#endif
#endif

#ifndef NETWORK_ETHERNET
#ifndef NETWORK_WIFI
#error "No network connection type defined"
#endif
#endif

#ifdef NETWORK_ETHERNET
#include "network_ethernet.hpp"
#elif NETWORK_WIFI
#include "network_wifi.hpp"
#endif

#define HEALTH_CHECK_INTERVAL_MS 2000 // Check every 2 seconds

class Network
{
public:
    Network(Display *display);
    ~Network();

    void setup();
    void loop();
    bool isHealthy();

#ifdef NETWORK_ETHERNET
    NetworkEthernet interface;
#elif NETWORK_WIFI
    NetworkWifi interface;
#endif

private:
    bool _is_healthy = false;
    unsigned long lastHealthCheck = 0;
    Display *display;
};

#pragma once

#include "network_interface.hpp"
#include "board_config.h"

#include <EthernetENC.h>

class NetworkEthernet : public NetworkInterface
{
public:
    void setup() override;
    bool isHealthy() override;
    void loop() override;
    IPAddress getCurrentIp() override;
    void end() override;

    EthernetClient &getClient() override;

private:
    EthernetClient client;
};
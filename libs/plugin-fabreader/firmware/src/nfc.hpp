#pragma once

#include <Arduino.h>
#include <Adafruit_PN532_NTAG424.h>
#include <Wire.h>
// Forward declare API instead of including the header
class API; // Forward declaration instead of #include "api.hpp"
#include "pins.hpp"

class NFC
{
public:
    // Using I2C with default IRQ and RESET pins (no pins need to be defined)
    NFC(API *api) : nfc(PIN_PN532_IRQ, PIN_PN532_RESET, &Wire), api(api) {}
    ~NFC() {}

    void setup();
    void loop();

    void enableCardChecking();
    void disableCardChecking();

    bool changeKey(uint8_t keyNumber, uint8_t authKey[16], uint8_t newKey[16]);
    bool writeData(uint8_t authKey[16], uint8_t keyNumber, uint8_t data[], size_t dataLength);

private:
    Adafruit_PN532 nfc;
    API *api;

    unsigned long last_check_for_card = 0;
    void checkForCard();

    bool is_card_checking_enabled = false;
};
#pragma once

#include <Arduino.h>
#include <Adafruit_PN532_NTAG424.h>
#include <SPI.h>
#include "pins.hpp"
#include "api.hpp"

class NFC
{
public:
    NFC(API *api) : nfc(PIN_SPI_SCK, PIN_SPI_MISO, PIN_SPI_MOSI, PIN_SPI_CS_PN532), api(api) {}
    ~NFC() {}

    void setup();
    void loop();

private:
    Adafruit_PN532 nfc;
    API *api;

    unsigned long last_check_for_card = 0;
    void checkForCard();
};
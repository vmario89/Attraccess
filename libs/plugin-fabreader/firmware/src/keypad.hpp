#pragma once

#include <Arduino.h>
#include <I2CKeyPad.h>
#include "configuration.hpp"

class Keypad
{
public:
    Keypad() : keyPad(I2C_KEYPAD_ADDRESS) {}

    void setup();
    char readKey();

private:
    I2CKeyPad keyPad;
    char keymap[19] = "NNNNN4N5N7N8#N3NN";
    char confirm_key = '#';
    char released_key = 'N';
};
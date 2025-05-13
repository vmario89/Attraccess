#include "keypad.hpp"

void Keypad::setup()
{
    if (this->keyPad.begin() == false)
    {
        Serial.println("\nERROR: cannot communicate to keypad.\nPlease reboot.\n");
        while (1)
        {
            delay(1000);
        }
    }
}

char Keypad::readKey()
{
    char key = this->keymap[this->keyPad.getKey()];

    if (key == this->released_key)
    {
        return '\0'; // Return null character instead of undefined 'null'
    }

    Serial.println("Key pressed (" + String(key) + ")");

    while (this->keymap[this->keyPad.getKey()] != this->released_key)
    {
        delay(10);
    }

    Serial.println("Key released (" + String(key) + ")");

    return key;
}
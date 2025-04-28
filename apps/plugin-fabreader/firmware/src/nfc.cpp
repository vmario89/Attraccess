#include "nfc.hpp"

void NFC::setup()
{
    Serial.println("[NFC] Setup");

    this->nfc.begin();

    uint32_t versiondata = 0;
    do
    {
        versiondata = nfc.getFirmwareVersion();

        if (!versiondata)
        {
            Serial.print("Error: Didn't find PN53x board. Check wiring.");
            delay(1000);
        }
    } while (!versiondata);

    // Print board info
    Serial.print("Found PN53x board version: ");
    Serial.print((versiondata >> 24) & 0xFF, HEX);
    Serial.print('.');
    Serial.print((versiondata >> 16) & 0xFF, DEC);
    Serial.print('.');
    Serial.println((versiondata >> 8) & 0xFF, DEC);

    // Configure the PN532 to read ISO14443A tags
    nfc.SAMConfig();
}

void NFC::loop()
{
    this->checkForCard();
}

void NFC::checkForCard()
{
    if (millis() - this->last_check_for_card < 1000)
    {
        return;
    }

    this->last_check_for_card = millis();

    uint8_t uid[7];
    uint8_t uidLength;
    bool foundCard = this->nfc.readPassiveTargetID(PN532_MIFARE_ISO14443A, uid, &uidLength, 1000);

    if (foundCard)
    {
        this->api->sendNFCTapped(uid, uidLength);
    }
}
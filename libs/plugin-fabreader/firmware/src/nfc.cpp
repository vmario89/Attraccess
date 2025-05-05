#include "nfc.hpp"
#include "api.hpp"

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

void NFC::enableCardChecking()
{
    this->is_card_checking_enabled = true;
}

void NFC::disableCardChecking()
{
    this->is_card_checking_enabled = false;
}

void NFC::loop()
{
    this->checkForCard();
}

void NFC::checkForCard()
{
    if (!this->is_card_checking_enabled)
    {
        return;
    }

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

const uint8_t AUTH_CMD = 0x71;
bool NFC::changeKey(uint8_t keyNumber, uint8_t authKey[16], uint8_t newKey[16])
{
    Serial.print("[NFC] Change key ");
    Serial.print(keyNumber);
    Serial.print(" with auth key xxx");
    for (int i = 10; i < 16; i++)
    {
        Serial.print(authKey[i], HEX);
    }
    Serial.print(" to new key xxx");
    for (int i = 10; i < 16; i++)
    {
        Serial.print(newKey[i], HEX);
    }
    Serial.println();

    Serial.println("[NFC] Authenticating key " + String(keyNumber));
    if (!this->nfc.ntag424_Authenticate(authKey, keyNumber, AUTH_CMD))
    {
        Serial.println("[NFC] Authentication failed");
        return false;
    }

    Serial.println("[NFC] Authentication successful");

    Serial.println("[NFC] Changing key " + String(keyNumber));

    Serial.println("Change key call 2");
    if (!this->nfc.ntag424_ChangeKey(authKey, newKey, keyNumber))
    {
        Serial.println("[NFC] Change key failed");
        return false;
    }

    Serial.println("[NFC] Change key successful");

    return true;
}

bool NFC::writeData(uint8_t authKey[16], uint8_t keyNumber, uint8_t data[], size_t dataLength)
{
    uint8_t fileNumberForCustomData = 0x03;

    if (!this->nfc.ntag424_Authenticate(authKey, keyNumber, AUTH_CMD))
    {
        Serial.println("[NFC] Authentication failed");
        return false;
    }

    Serial.println("[NFC] Authentication successful");

    bool success = this->nfc.ntag424_WriteData(data, fileNumberForCustomData, 0, dataLength, keyNumber);

    if (!success)
    {
        Serial.println("[NFC] Write data failed");
        return false;
    }

    Serial.println("[NFC] Write data successful");
    return true;
}

bool NFC::authenticate(uint8_t keyNumber, uint8_t authKey[16])
{
    return this->nfc.ntag424_Authenticate(authKey, keyNumber, AUTH_CMD);
}
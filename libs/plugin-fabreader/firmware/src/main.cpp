#include <Arduino.h>
#include "network.hpp"
#include "configuration.hpp"
#include "persistence.hpp"
#include "api.hpp"
#include "nfc.hpp"
#include "display.hpp"

#include <SPI.h>
#include <Wire.h>

Display display;
Network network(&display);
API api(network.interface.getClient(), &display);
NFC nfc(&api);

void setup()
{
  Serial.begin(115200);
  delay(2000);

  Serial.println("FABReader starting...");

  // Initialize SPI for other peripherals if needed
  SPI.begin(PIN_SPI_SCK, PIN_SPI_MISO, PIN_SPI_MOSI);

  // Initialize I2C for NFC
  Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL, I2C_FREQ);

  Persistence::setup();
  nfc.setup();
  display.setup();
  network.setup();
  api.setup(&nfc);
}

void loop()
{
  network.loop();
  if (network.isHealthy())
  {
    api.loop();
    nfc.loop();
  }
  display.loop();
}
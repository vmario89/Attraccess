#include <Arduino.h>
#include "network.hpp"
#include "pins.hpp"
#include "configuration.hpp"
#include "persistence.hpp"
#include "api.hpp"
#include "nfc.hpp"

#include <SPI.h>
#include <Wire.h>

Network server_connection;
API api(server_connection.interface.getClient());
NFC nfc(&api);

void setup()
{
  Serial.begin(115200);
  delay(2000);

  Persistence::setup();

  Serial.println("FABReader starting...");

  // Initialize SPI for other peripherals if needed
  SPI.begin(PIN_SPI_SCK, PIN_SPI_MISO, PIN_SPI_MOSI);

  // Initialize I2C for NFC
  Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL, I2C_FREQ);

  server_connection.setup();
  api.setup(&nfc);
  nfc.setup();
}

void loop()
{
  server_connection.loop();
  api.loop();
  nfc.loop();
}
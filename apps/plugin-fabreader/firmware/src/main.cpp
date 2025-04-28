#include <Arduino.h>
#include "network.hpp"
#include "pins.hpp"
#include "api.hpp"
#include "persistence.hpp"
// #include "nfc.hpp"

#include <SPI.h>

Network server_connection;
API api(server_connection.interface.getClient());
// NFC nfc(&api);

void setup()
{
  Serial.begin(115200);
  delay(2000);

  Persistence::setup();

  Serial.println("FABReader starting...");

  SPI.begin(PIN_SPI_SCK, PIN_SPI_MISO, PIN_SPI_MOSI);

  server_connection.setup();
  api.setup();
  // nfc.setup();
}

void loop()
{
  server_connection.loop();
  api.loop();
  // nfc.loop();
}
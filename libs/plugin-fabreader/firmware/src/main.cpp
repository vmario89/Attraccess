#include <Arduino.h>
#include "network.hpp"
#include "configuration.hpp"
#include "persistence.hpp"
#include "api.hpp"
#include "nfc.hpp"
#include "display.hpp"
#include "keypad.hpp"

#include <SPI.h>
#include <Wire.h>

Display display;
Network network(&display);
Keypad keypad;
API api(network.interface.getClient(), &display, &keypad);
NFC nfc(&api);

// Task handle for the display task
TaskHandle_t displayTaskHandle = NULL;

// Display task function
void userTask(void *parameter)
{
  const int REFRESH_RATE_HZ = 60;
  const int MS_PER_SECOND = 1000;
  const int LOOP_DELAY_MS = (MS_PER_SECOND / REFRESH_RATE_HZ) / portTICK_PERIOD_MS;

  display.setup();
  for (;;)
  {
    display.loop();
    vTaskDelay(LOOP_DELAY_MS);
  }
}

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
  keypad.setup();
  network.setup();
  api.setup(&nfc);

  // Create the display task (core 1, priority 1)
  xTaskCreatePinnedToCore(
      userTask,           // Task function
      "DisplayTask",      // Task name
      4096,               // Stack size (bytes)
      NULL,               // Task parameters
      3,                  // Priority (1 is low, configMAX_PRIORITIES-1 is highest)
      &displayTaskHandle, // Task handle
      NULL                // Run on core 1 (ESP32 has 2 cores: 0 and 1)
  );
}

void loop()
{
  network.loop();
  if (network.isHealthy())
  {
    api.loop();
    nfc.loop();
  }
}
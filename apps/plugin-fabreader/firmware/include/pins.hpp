#pragma once

#define PIN_SPI_SCK (10)
#define PIN_SPI_MISO (8)
#define PIN_SPI_MOSI (7)

#define PIN_I2C_SDA (7)
#define PIN_I2C_SCL (6)

#define PIN_PN532_IRQ (-1)
#define PIN_PN532_RESET (-1)

// Device Specific Chip Select (CS/SS) Pins:
#define PIN_SPI_CS_PN532 (1) // PN532 NFC Reader
#define PIN_SPI_CS_ETH (3)   // ENC28J60 Ethernet Module

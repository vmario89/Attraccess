# Fabreader Firmware

This directory contains the firmware for the Fabreader device, an ESP32-C3 based RFID/NFC reader.

## Web Installation

You can install the firmware directly from your web browser using [ESP Web Tools](https://esphome.github.io/esp-web-tools/), which allows for a seamless installation experience without requiring command-line tools.

### Requirements

- Chrome or Edge browser on desktop (Web Serial is not supported on mobile or Firefox)
- ESP32-C3 based Fabreader device
- USB connection to your computer

### Quick Installation

1. Connect your Fabreader device to your computer via USB
2. Visit our [firmware installation page](https://OWNER_NAME.github.io/Attraccess/) (replace OWNER_NAME with your GitHub username)
3. Click the "Install" button and follow the on-screen instructions
4. If prompted, select the correct serial port for your device
5. Wait for the installation to complete

### Manual Installation

If the web installer doesn't work for you, you can download the firmware binary from the [Releases](https://github.com/OWNER_NAME/Attraccess/releases) page and flash it using esptool:

```bash
# Install esptool
pip install esptool

# Flash the firmware
esptool.py --chip esp32c3 --port /dev/ttyUSB0 --baud 921600 write_flash 0x0 merged-firmware.bin
```

Replace `/dev/ttyUSB0` with the correct port for your device:

- On Windows, this will be a COM port (e.g., COM3)
- On macOS, this will be something like `/dev/tty.usbserial-X`
- On Linux, it's typically `/dev/ttyUSB0` or `/dev/ttyACM0`

## Development Setup

1. Install [PlatformIO](https://platformio.org/)
2. Clone this repository
3. Open the `apps/fabreader-firmware` directory in PlatformIO
4. Build and upload the firmware

## Development

### Project Structure

- `src/`: Contains the source code for the firmware
- `include/`: Header files
- `lib/`: Libraries
- `platformio.ini`: PlatformIO configuration file

### Building

To build the firmware, run:

```bash
pio run -e fabreader
```

### Uploading During Development

To upload the firmware to a connected device, run:

```bash
pio run -e fabreader -t upload
```

## Continuous Integration

This project uses GitHub Actions for continuous integration:

1. Every push to the main branch or pull request that changes files in the `apps/fabreader-firmware` directory triggers a build
2. The firmware is built using PlatformIO
3. A merged binary and manifest file for ESP Web Tools are created
4. These files are uploaded as artifacts and also deployed to GitHub Pages
5. When a release is created, the firmware is attached to the release

### How ESP Web Tools Integration Works

The GitHub Actions workflow:

1. Builds the firmware using PlatformIO
2. Creates a merged binary file compatible with ESP Web Tools
3. Generates a manifest.json file with absolute URLs to the firmware
4. Deploys these files to GitHub Pages
5. Creates a web interface with the ESP Web Tools install button

The manifest.json file contains the necessary information for ESP Web Tools to install the firmware, including the URL to the firmware binary and the chip family (ESP32-C3).

## License

[Specify your license here]

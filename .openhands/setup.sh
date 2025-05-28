#!/bin/bash

echo "Installing pnpm globally (if not already present or to ensure version)..."
npm install -g pnpm

echo "Installing node modules..."
pnpm install

echo "Installing/Updating PlatformIO Core..."
pip3 install -U platformio

echo "Setup complete."

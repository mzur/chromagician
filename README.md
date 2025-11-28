# CHROMAGICIAN 🪄

A real-time color detection tool to highlight colored objects using a phone camera.

## What It Does

Chromagician uses your device's camera to detect specific colors in real-time and overlays them with an animated black-and-white crosshatch pattern. It can help people with impaired vision to find objects based on their color.

## How It Works

1. Open the app in your mobile browser
2. Grant camera permissions when prompted
3. Select the color you want to identify using the buttons at the bottom
4. Point your camera at objects - items of the selected color will show the animated crosshatch pattern

## Development

### Setup

```bash
npm install
npm run dev
```

### Build

```bash
npm run build
```

## Color Detection

The app detects colors using HSV (Hue, Saturation, Value) color space thresholds:

- **Red** (1): Hue 0°-15° and 340°-360°
- **Orange** (2): Hue 15°-30°
- **Yellow** (3): Hue 30°-60°
- **Green** (4): Hue 60°-180°
- **Blue** (5): Hue 180°-260°
- **Purple** (6): Hue 260°-340°

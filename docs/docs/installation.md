---
sidebar_position: 2
---

# Installation

The latest version of Boson can be downloaded and installed from the GitHub [releases page](https://github.com/albireox/boson/releases). Currently only macOS builds are generated. If these builds don't work for you try [building from source](#running-from-source).

In macOS make sure to download the correct file for your architecture. If you're running on an M1 Mac you should download the `arm64` version, otherwise use the `x64` one. Note that the `x64` version will work (although with potential problems) in an M1 computer but the `arm64` binary won't work on an Intel-based Mac.

## Updating Boson

Boson checks for updates on start and every 10 minutes. If an update is available you'll receive a notification allowing you to restart and run the new version.

:::info
There's currently no way to skip an update. Once downloaded the new version will always be installed after a restart.
:::

:::caution
Due to a [known issue](https://github.com/electron/electron/issues/25626) the app fails to restart after one presses the restart button in the auto-uploader notification. In this case the solution is to manually close the app. Boson will then restart without the user having to open it again.
:::


## Running or building from source {#running-from-source}

To run Boson from source first you'll need an installation of Node.js (Boson is confirmed to work well with Nide.js 16 but previous versions are likely to work) and [yarn](https://yarnpkg.com).

Start by cloning the repository

```bash
git clone https://github.com/albireox/boson
cd boson
```

Then install the package

```bash
yarn install
```

You can run Boson in development mode with

```bash
yarn start
```

or generate a production build

```bash
yarn build
```

which will be saved to the `dist/` directory.

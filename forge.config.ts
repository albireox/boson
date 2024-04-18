import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerDMG } from '@electron-forge/maker-dmg';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { VitePlugin } from '@electron-forge/plugin-vite';
import type { ForgeConfig } from '@electron-forge/shared-types';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import fs from 'fs/promises';
import path from 'path';

const config: ForgeConfig = {
  packagerConfig: {
    icon: 'public/icon',
    asar: true,
    extraResource: ['resources/sounds'],
    osxSign: {
      optionsForFile: () => {
        return {
          // https://github.com/electron-userland/electron-builder/issues/3940#issuecomment-501702531
          entitlements: 'resources/entitlements.mac.plist',
          entitlementsInherit: 'resources/entitlements.mac.plist',
          hardenedRuntime: true,
        };
      },
      identity: process.env.APPLE_IDENTITY,
    },
    osxNotarize: {
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_ID_PASS,
      teamId: process.env.APPLE_TEAM_ID,
    },
  },
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'albireox',
          name: 'boson',
        },
        draft: true,
        prerelease: false,
        tagPrefix: 'v',
      },
    },
  ],
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({}),
    new MakerZIP({}, ['darwin']),
    new MakerRpm({}),
    new MakerDeb({}),
    new MakerDMG(
      {
        icon: 'public/icon.icns',
        background: 'resources/DMGBackground.png',
      },
      ['darwin']
    ),
  ],
  hooks: {
    packageAfterPrune: async (_config, buildPath) => {
      const gypPath = path.join(
        buildPath,
        'node_modules',
        'js9',
        'node_modules'
      );
      await fs.rm(gypPath, { recursive: true, force: true });
    },
  },
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: 'src/main/main.ts',
          config: 'vite.main.config.ts',
        },
        {
          entry: 'src/main/preload.ts',
          config: 'vite.preload.config.ts',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;

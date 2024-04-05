boson
=====

`boson` is a prototype GUI meant to expand and eventually replace [STUI](https://github.com/ApachePointObservatory/stui). It uses the following libraries and frameworks:

- [Typescript](https://typescriptlang.org/) for event management.
- [electron](https://electronjs.org) for window management and packaging.
- [React](https://reactjs.org) for building interfaces.
- [Material UI](https://material-ui.com) for React components with a unified design.

Development
-----------

`boson` uses the [Electron Forge](https://www.electronforge.io) boilerplate with the `vite-typescript` template. First, install the dependencies with [yarn](https://yarnpkg.com) (use of `npm` may be possible but is not tested; please do not commit the `package-lock.json` file). Note that this workflow is tested with `yarn` 4.1.0+ and `node` 21 on macOS Sonoma. It may not work in other systems.

```console
yarn install
```

You can run the application in development mode with

```console
yarn start
```

To package the app for distribution do

```console
yarn package
```

and to publish it to GitHub as a draft release, do

```console
yarn publish
```

The packaging script will try to code sign and [notarise](https://github.com/electron/notarize?tab=readme-ov-file#what-is-app-notarization) your macOS binaries, for which you need to have set `$APPLE_ID` and `$APPLE_ID_PASS` to an email and app-specific password that can be used to notarize `boson`. In general you don't need to worry about notarising since the CI workflow will do it for you, but note that if you try to distribute a non-notarised app most users won't be able to run it without disabling Gatekeeper.

Continuous Integration
----------------------

The GitHub workflow [publish.yml](.github/workflows/publish.yml) will build and notarise the application (currently only macOS binaries are produced) in three circumstances:

- When a new tag is pushed.
- When the workflow is manually initiated as a workflow dispatch.

For new tags the workflow will create a new draft release and publish the artifacts there. The user needs to manually edit the release notes and publish the release, which will in turn trigger the auto uploader to download the new version.

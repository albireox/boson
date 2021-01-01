boson
=====

`boson` is a prototype GUI meant to expand and eventually replace [STUI](https://github.com/ApachePointObservatory/stui). It uses the following libraries and frameworks:

- [Typescript](https://typescriptlang.org/) for event management.
- [electron](https://electronjs.org) for window management and packaging.
- [React](https://reactjs.org) for building interfaces.
- [Material UI](https://material-ui.com) for React components with a unified design.

Development
-----------

`boson` uses the [Create React App](https://create-react-app.dev) boilerplate. First, install the dependencies with [yarn](https://yarnpkg.com) (you can use `npm` but please do not commit the `package-lock.json` file)

```console
yarn install
```

You can run the application in development mode with

```console
yarn start
```

You can package the application with

```console
yarn build
```

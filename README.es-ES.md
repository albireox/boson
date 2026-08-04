

boson
=====

`boson` es una interfaz gráfica de usuario (GUI) de prototipo diseñada para ampliar y, eventualmente, reemplazar [STUI](https://github.com/ApachePointObservatory/stui). Utiliza las siguientes bibliotecas y frameworks:

- [Typescript](https://typescriptlang.org/) para la gestión de eventos.
- [electron](https://electronjs.org) para la gestión de ventanas y empaquetado.
- [React](https://reactjs.org) para la construcción de interfaces.
- [Material UI](https://material-ui.com) para componentes de React con un diseño unificado.

Desarrollo
-----------

`boson` utiliza la plantilla base (boilerplate) de [Electron Forge](https://www.electronforge.io) con la plantilla `vite-typescript`. Primero, instala las dependencias con [yarn](https://yarnpkg.com) (el uso de `npm` podría ser posible pero no está probado; por favor, no hagas commit del archivo `package-lock.json`). Ten en cuenta que este flujo de trabajo se ha probado con `yarn` 4.1.0+ y `node` 21 en macOS Sonoma. Es posible que no funcione en otros sistemas.

```console
yarn install
```

Puedes ejecutar la aplicación en modo de desarrollo con

```console
yarn start
```

Para empaquetar la aplicación para su distribución, ejecuta

```console
yarn package
```

y para publicarla en GitHub como un lanzamiento en borrador, ejecuta

```console
yarn publish
```

El script de empaquetado intentará firmar digitalmente y [notarizar](https://github.com/electron/notarize?tab=readme-ov-file#what-is-app-notarization) tus binarios de macOS, para lo cual necesitas haber configurado `$APPLE_ID` y `$APPLE_ID_PASS` con un correo electrónico y una contraseña específica de aplicación que puedan usarse para notarizar `boson`. En general, no necesitas preocuparte por la notarización, ya que el flujo de trabajo de CI lo hará por ti, pero ten en cuenta que si intentas distribuir una aplicación sin notarizar, la mayoría de los usuarios no podrán ejecutarla sin desactivar Gatekeeper.

Integración Continua
----------------------

El flujo de trabajo de GitHub [publish.yml](.github/workflows/publish.yml) compilará y notarizará la aplicación (actualmente solo se generan binarios para macOS) en tres circunstancias:

- Cuando se envía (push) una nueva etiqueta (tag).
- Cuando el flujo de trabajo se inicia manualmente como un workflow dispatch.

Para nuevas etiquetas, el flujo de trabajo creará un nuevo lanzamiento en borrador y publicará los artefactos allí. El usuario debe editar manualmente las notas de lanzamiento y publicar el lanzamiento, lo que a su vez activará el cargador automático para descargar la nueva versión.

# Shell

This project is an Angular shell that acts as factory and demo for Cybrid SDK ui components.

## Installation

Run `npm i` from the project root `/sdk-ui-web` to install dependencies.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. Changes made to component source files will not be reflected on refresh of the running application. To see changes you will have to rebuild the component library.

## Component overview

The ui components are stored in `/components`. Each component is an Angular Element which bootstraps and wraps itself in a Web Component. For more information visit [Angular Elements](https://angular.io/guide/elements) or [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components).

## Library requirements

To include the ui library, simply load it into your index.html as a script. All included ui components will be accessible via their html tag names. In the example below we are using the `<list-element>`'
```shell
<!DOCTYPE html>
<html lang="en">
  <head>
    <script src="cybrid-ui.js"></script>
  </head>
  <body>
  <list-element></list-element>
  </body>
</html>
```

## Build

To build the shell project run `ng build`.

### Component and library build commands

```shell
# Build a component to dist/element-name/
ng run component-name:build

# Build and bundle component to dist/element-name/element-name.js
npm run component:element-name

# Build ui and core libraries
npm run component:library
```
## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

To execute component specific unit tests run `ng run component-name:test:`

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## License
This project is licensed under Apache 2.0, found in [LICENSE](https://github.com/Cybrid-app/Cybrid-SDK/blob/main/LICENSE)

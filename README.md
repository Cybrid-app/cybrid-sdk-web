![](https://github.com/Cybrid-app/Cybrid-SDK/workflows/tests/badge.svg)
[![Codecov](https://img.shields.io/codecov/c/github/Cybrid-app/Cybrid-SDK?token=ONZBDNW37S)](https://codecov.io/gh/Cybrid-app/Cybrid-SDK)

# Cybrid SDK Web

This project contains a [Library](/library) of web components that interface with Cybrid's api, and a [Demo Application](/src) containing them

## Installation

Run `npm i` from the project root to install dependencies

## Run Demo

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. While running locally, most browsers will block Cybrid api requests due to Cross-Origin Resource Sharing (CORS) rules. You must disable CORS to properly view the demo. Here's a handy script (for Mac OSX) that opens a developer friendly instance of Google Chrome:
```shell
open -n -a /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --args --user-data-dir="/tmp/chrome_dev_test" --disable-web-security
```

## Component overview

The ui components are stored in [library](/library). The components are Angular Elements which bootstrap and wraps themselves in a Web Component. For more information visit [Angular Elements](https://angular.io/guide/elements) or [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components).

## Build

To build the demo project run `ng build`

To build the component library run `ng run package:library`

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

To execute component specific unit tests run `ng run component-name:test:`

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## License
This project is licensed under Apache 2.0, found in [LICENSE](https://github.com/Cybrid-app/Cybrid-SDK/blob/main/LICENSE)

![CircleCI](https://circleci.com/gh/Cybrid-app/cybrid-sdk-web.svg?style=svg)
[![codecov](https://codecov.io/gh/Cybrid-app/cybrid-sdk-web/branch/main/graph/badge.svg?token=2U326QU5J6)](https://codecov.io/gh/Cybrid-app/cybrid-sdk-web)

# Cybrid SDK Web

This project contains a [Library](/library) of web components that interface with Cybrid's api, and a [Demo Application](/src) containing them

## Components 
The ui components are stored in [library](/library) and are Angular Elements which bootstrap and wrap themselves in a Web Component. For more information visit [Angular Elements](https://angular.io/guide/elements) or [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components)

NPM Package: [@cybrid/cybrid-sdk-ui-js]()

More information: [README](library/README.md)

# Demo

## Live
The current demo is continually updated and live for testing at: https://cybrid-app.github.io/cybrid-sdk-web/

To login you will need to have the following:
- Api keys (Id and Secret) or a valid Bearer token
- Customer GUID

Most browsers will block Cybrid api requests due to Cross-Origin Resource Sharing (CORS) rules. You must disable CORS to properly view the demo. Here's a handy script (for Mac OSX) that opens a developer friendly instance of Google Chrome:
```shell
open -n -a /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --args --user-data-dir="/tmp/chrome_dev_test" --disable-web-security
```

## Installation

Install Node. Current version: [Node@16.14.2](https://nodejs.org/en/)

Run `npm install` from the project root to install dependencies

## Run

Run `ng serve` for a dev server

Navigate to `http://localhost:4200/`

## Build

To build the demo project run `ng build`

## Test

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## License
This project is licensed under Apache 2.0, found in [LICENSE](https://github.com/Cybrid-app/Cybrid-SDK/blob/main/LICENSE)

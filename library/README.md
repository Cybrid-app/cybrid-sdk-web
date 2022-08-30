## @cybrid/cybrid-sdk-ui-js

This package includes a bundled javascript web component (application) containing a variety of styled components that interface with Cybrid's api.

## Install

```shell
npm install @cybrid/cybrid-sdk-ui-js@latest --save
```

## Quick Start

### Cross-Origin Resource Sharing (CORS)

The following URL's will have to be whitelisted to properly view the components:

Crypto currency icon assets: [https://images.cybrid.xyz/](https://images.cybrid.xyz/color/)

### HTML

To use the application via html load it into your index.html as a script.

> NOTE: If you are embedding this library in an Angular application you will want to omit `cybrid-sdk-ui.polyfills.js` to avoid duplication of `zone.js`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Host Application</title>

    // Omit if already importing zone.js in an Angular application
    <script type="module" src="cybrid-sdk-ui.polyfills.js"></script>

    // Main, runtime, and css bundle
    <script type="module" src="cybrid-sdk-ui.min.js"></script>
  </head>
  <body>
    <cybrid-app [auth]="your_JWT"></cybrid-app>
  </body>
</html>
```

### Javascript

You can generate the application in Javascript instead of using the selector in HTML:

> NOTE: You must still reference `'cybrid-app'` in `document.createElement()`

```html
<script>
  const cybridApp = document.createElement('cybrid-app');
  cybrid.auth = 'your_JWT';
  cybrid.hostConfig = 'config';
  cybrid.component = 'component';
  document.body.append(cybridApp);
</script>
```

If you want to append the application elsewhere than the body try:

```html
document.getElementById('custom-element-id').append(cybrid);
```

## Configuration

You can change configuration during runtime. The application:

- Accepts an `auth`, `hostConfig`, and `component` property
- Emits events via `eventLog` and `errorLog`

### `auth` (required)

Expects a JSON Web Token. **_The component won't display unless the bound JWT is valid_**.

Example:

```html
<cybrid-app [auth]="your_JWT"></cybrid-app>
```

### `hostConfig` (required)

A default component configuration is set if no host config is bound. The full configuration object must be defined.

> NOTE: Config is currently required due to the necessity of a customer GUID. In the future this will be removed and revert to a default config if undefined. The customer GUID will be embedded in the JWT.

```typescript
interface ComponentConfig {
  // The number in milliseconds the component waits before refreshing data
  // Default: 5000
  refreshInterval: number;

  // The current locale
  // Supports: 'en-US' | 'fr-CA'
  // Default: 'en-US'
  locale: string;

  // Light mode or dark mode styling
  // Supports: 'LIGHT' | 'DARK'
  // Default: 'LIGHT'
  theme: string;

  // The current customer GUID
  customer: string;
  
  // The current fiat currency (counter asset for all value calculation)
  // Supports: 'USD | CAD'
  // Default: 'USD'
  fiat: string;

  // Routing flag to enable or disable internal routing between components
  // Default: true
  routing: boolean;
}
```

> NOTE: Disabling routing will also remove routing elements from the ui, like the back button in `trade`. The app will still fire events where routing would have typically occurred such as completing a trade, or clicking an asset in the `price-list`. See 'Events' below for more information.

Example:

```typescript
your_config = {
  refreshInterval: 10000,
  locale: 'fr-CA',
  theme: 'DARK',
  customer: '969c744a02b11ed', //example GUID,
  fiat: 'USD',
  routing: true
};
```

```html
<cybrid-app [config]="your_config"></cybrid-app>
```

### `component` (optional)

The currently displayed component. By default the `price-list` component is rendered.

Components:

- `price-list`
- `trade`
- `account`

> The account-list must be given an account to render.
- `account-list`

Example:

```html
<cybrid-app [component]="trade"></cybrid-app>
```

### Events

An event logging service that can be subscribed to. Emits application events and errors as an `eventLog` Object:

```typescript
interface EventLog {
  level: LEVEL;
  code: CODE;
  message: string;
  data?: any;
}
```

Example:

```html
<cybrid-app (eventLog)="handleEvent($event)"></cybrid-app>
```

Javascript:

```javascript
cybridApp.addEventListener('eventLog', (event) => {
  console.log(event.detail);
});
```

Event listing:

### `cybrid-app`

| LEVEL | CODE              | MESSAGE                                            | DATA                                                  |
| ----- | ----------------- | -------------------------------------------------- | ----------------------------------------------------- |
| INFO  | APPLICATION_INIT  | Initializing application                           | null                                                  |
| FATAL | APPLICATION_ERROR | Fatal error initializing application               | null                                                  |
| ERROR | SERVICE_ERROR     | There was a failure initializing the Event service | null                                                  |
| ERROR | SERVICE_ERROR     | There was a failure initializing the error service | null                                                  |
| INFO  | ROUTING_START     | Routing to: 'route'                                | {<br/>origin: 'component',<br/>default: 'route'<br/>} |
| INFO  | ROUTING_END       | Routing to: 'route'                                | {<br/>origin: 'component',<br/>default: 'route'<br/>} |
| INFO  | ROUTING_REQUEST   | Routing has been requested                         | {<br/>origin: 'component',<br/>default: 'route'<br/>} |

### `price-list`

| LEVEL | CODE           | MESSAGE                                | DATA |
| ----- | -------------- | -------------------------------------- | ---- |
| INFO  | COMPONENT_INIT | Initializing price list component      | null |
| INFO  | DATA_FETCHING  | Refreshing price list...               | null |
| ERROR | DATA_ERROR     | There was an error fetching price list | null |
| INFO  | DATA_REFRESHED | Price list successfully updated        | null |

### `trade`

| LEVEL | CODE           | MESSAGE                           | DATA |
| ----- | -------------- | --------------------------------- | ---- |
| INFO  | COMPONENT_INIT | Initializing trade component      | null |
| INFO  | DATA_FETCHING  | Refreshing price...               | null |
| ERROR | DATA_ERROR     | There was an error fetching price | null |
| INFO  | DATA_REFRESHED | Price successfully updated        | null |
| INFO  | DATA_FETCHING  | Refreshing quote...               | null |
| INFO  | DATA_FETCHING  | Fetching quote...                 | null |
| ERROR | DATA_ERROR     | Error fetching quote              | null |
| ERROR | DATA_ERROR     | Error confirming trade            | null |
| INFO  | DATA_FETCHING  | Fetching trade...                 | null |
| ERROR | DATA_ERROR     | Error fetching trade              | null |

### Errors

An error logging service that can be subscribed to. Emits application errors, as well as pass through api errors as an `errorLog` Object:

```typescript
interface ErrorLog {
  // 'Error' for an application error or the status code from an http error
  code: number | string;
  message: string;
  data?: any;
}
```

Example:

```html
<cybrid-app (errorLog)="handleError($event)"></cybrid-app>
```

Javascript:

```javascript
cybridApp.addEventListener('errorLog', (event) => {
  console.log(event.detail);
});
```

## License

This project is licensed under Apache 2.0, found in [LICENSE](https://github.com/Cybrid-app/Cybrid-SDK/blob/main/LICENSE)

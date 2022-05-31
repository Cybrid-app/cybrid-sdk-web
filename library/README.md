## @cybrid/cybrid-sdk-ui-js

This package includes a javascript library of styled web components that interface with Cybrid's api.

**_Repo_**: https://github.com/Cybrid-app/cybrid-sdk-ui-js

## Install

```shell
npm install @cybrid/cybrid-sdk-ui-js@latest --save
```
## Quick Start

### Cross-Origin Resource Sharing (CORS)
The following URL's will have to be whitelisted to properly view the components:

Crypto currency icon assets: [https://images.cybrid.xyz/](https://images.cybrid.xyz/color/)

### HTML

To use the ui library via html, simply load it into your index.html as a script. All included ui components will be accessible via their html selector. In the example below we are using the `<cybrid-price-list>`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Host Application</title>
    <script src="cybrid-sdk-ui.min.js"></script>
  </head>
  <body>
  <cybrid-price-list></cybrid-price-list>
  </body>
</html>
```

### Javascript

```html
<script>
  const list = document.createElement("cybrid-price-list");
  list.setAttribute("auth", "your_token")
  document.body.append(list);
</script>
```

## Components

**Price list:**`<cybrid-price-list></cybrid-price-list`

## Configuration

Each component:
- Accepts an `auth` and `config` property.
- Emits events via `eventLog` and `errorLog`
- Will handle changes during runtime

### Auth (required)

Expects a JSON Web Token. **_The component won't display unless the bound JWT is valid_**.

```html
<cybrid-price-list [auth]='your_JWT'></cybrid-price-list>
```

### Config (optional)

A default component configuration is set if no host config is bound. The full configuration object must be defined.

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
}
```

Example:
```typescript
your_config = {
  refreshInterval: 10000,
  locale: 'fr-CA',
  theme: 'DARK'
}
```
```html
<cybrid-price-list [config]='your_config'></cybrid-price-list>
```

### Events

An event logging service that can be subscribed to. Emits an `eventLog` Object:
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
<cybrid-price-list (eventLog)='handleEvent($event)'></cybrid-price-list>
```

### Errors

An error logging service that can be subscribed to. Emits an `errorLog` Object:
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
<cybrid-price-list (errorLog)='handleError($event)'></cybrid-price-list>
```

## License

This project is licensed under Apache 2.0, found in [LICENSE](https://github.com/Cybrid-app/Cybrid-SDK/blob/main/LICENSE)

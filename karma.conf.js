// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {
        autoCleanClosures: true
      },
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    jasmineHtmlReporter: {
      suppressAll: false // removes the duplicated traces
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/shell'),
      subdir: '.',
      reporters: [{ type: 'lcov' }],
      check: {
        emitWarning: true,
        global: {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
          excludes: [
            '/components/**/*.ts',
            '/modules/*.ts',
            '/services/**/*.ts'
          ]
        }
      }
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_ERROR,
    autoWatch: false,
    singleRun: true,
    browserNoActivityTimeout: 40000,
    browsers: ['ChromeHeadlessCI'],
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    },
    restartOnFileChange: true
  });
};

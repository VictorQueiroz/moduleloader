# moduleloader

This module depends directly on [injection](https://github.com/VictorQueiroz/injector).

### Installation
```
bower install --save moduleloader
```

### Usage
```js
moduleLoader.register('anotherModule', []);
moduleloader.register('app', ['anotherModule']);

moduleLoader.register('anotherModule').service('Http', function() {
  return function(method, url, callback) {
    var xhr = new XMLHttpRequest();

    // instructions
    callback(data);
  };
});

// Will be executed before the module bootstrap
moduleLoader.register('app').config(function(Http) {
  Http('GET', '/api/users', function(data) {
    alert('The total number of users is ' + data.length);
  });
});

moduleLoader.bootstrap('app');
```

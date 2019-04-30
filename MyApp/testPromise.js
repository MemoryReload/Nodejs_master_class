const Promise = require("./lib/promise.js");

function someAsyncFunction() {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      var value = Math.ceil(Math.random() * 10);
      if (value % 2) {
        resolve(value);
      } else {
        reject(value);
      }
    }, 0);
  });
}

var promise = someAsyncFunction();
promise.then(function(odd) {
  console.log("odd number: " + odd);
  return odd;
}, function(even) {
  console.log("even number: " + even);
  return even;
});

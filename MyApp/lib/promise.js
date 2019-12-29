function Promise(operation) {
  var state = "pending";
  var deferred = null;
  var value;

  var resolve = function(newValue) {
    try {
            if (newValue && typeof newValue.then === 'function') {
                newValue.then(resolve, reject);
                return;
            }
            state = 'resolved';
            value = newValue;
            if (deferred) {
                handle(deferred);
            }
        } catch (err) {
            reject(err);
        }
  };

  var reject = function(error) {
    state = "rejected";
    value = error;
    if (deferred) {
      handle(deferred);
    }
  };

  var handle = function(handler) {
    if (state === "pending") {
      deferred = handler;
      return;
    }

    console.assert(value != undefined, "bad value");

    setTimeout(function() {
      var handlerCb;

      if (state === "resolved") {
        handlerCb = handler.onResolve;
      } else if (state === "rejected") {
        handlerCb = handler.onReject;
      }

      if (handlerCb) {
        var valueOrReson;
        try {
          valueOrReson = handlerCb(value);
        } catch (e) {
          handler.reject(e);
          return;
        }
        if (state === "resolved") {
          handler.resolve(valueOrReson);
        } else if (this.state === "rejected") {
          handler.reject(valueOrReson);
        }
      } else {
        if (state === "resolved") {
          handler.resolve(value);
        } else if (this.state === "rejected") {
          handler.reject(value);
        }
      }
    }, 1);
  };

  this.then = function(onResolve, onReject) {
    return new Promise(function(resolve, reject) {
      handle({
        onResolve: onResolve,
        onReject: onReject,
        resolve: resolve,
        reject: reject
      });
    });
  };

  operation(resolve, reject);
};

module.exports = Promise;

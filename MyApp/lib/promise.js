function Promise(operation) {
  var state = "pending";
  var deffered = null;
  var value;

  var resolve = function(newValue) {
    state = "resolved";
    value = newValue;
    if (deffered) {
      handle(deffered);
    }
  };

  var reject = function(error) {
    state = "rejected";
    value = error;
    if (deffered) {
      handle(deffered);
    }
  };

  var handle = function(handler) {
    if (state === "pending") {
      deffered = handler;
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

importScripts("/engine/wasm_exec.js");

const pending = [];
let send = null;

self.silverfishReady = function () {
  send = self.silverfishSend;
  self.silverfishOnOutput(function (line) {
    self.postMessage(line);
  });
  while (pending.length) {
    send(pending.shift());
  }
};

self.onmessage = function (e) {
  if (send) {
    send(e.data);
  } else {
    pending.push(e.data);
  }
};

const go = new Go();
WebAssembly.instantiateStreaming(fetch("/engine/silverfish.wasm"), go.importObject).then(
  (result) => go.run(result.instance)
);

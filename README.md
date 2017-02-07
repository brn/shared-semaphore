# What's this?

ES2017 Atomics and SharedArrayBuffer based Semaphore for WebWorker.

Current works on Google Chrome Canary only.

If you know SharedArrayBuffer and Atomics, Read,
[Shared Memory and Atomics](https://github.com/tc39/ecmascript_sharedmem).

# install

```
npm install shared-semaphore
```

# Usage

In main thred,

```javascript
const MAX_WORKERS = 10;
const workers = [];
const semaphore = new Semaphore(2);

for (let i = 0; i < MAX_WORKERS; i++) {
  workers.push(new Worker('worker.js'));
}

workers.forEach(worker => worker.postMessage({shared: semaphore.shared}));
```

In worker thread.

```javascript
importScripts('semaphore.js');

self.addEventListener('message', function(e) {
  const {shared} = e.data;
  const semaphore = Semaphore.fromShared(shared, 2);
  
  console.log('foo');
  console.log('foobar');
  console.log('foobarbaz');

  semaphore.signal();
}, false);

```

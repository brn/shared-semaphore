# What's this?

ES2017 Atomics and SharedArrayBuffer based Semaphore for WebWorker.

Current works on Google Chrome Canary only.

If you don't know about SharedArrayBuffer and Atomics,  
Following pages explain what, how, why.  
[Shared Memory and Atomics](https://github.com/tc39/ecmascript_sharedmem).  
[ECMAScript Shared Memory and Atomics](http://tc39.github.io/ecmascript_sharedmem/shmem.html#Overview)

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

# API

## Semaphore

**`Semaphore(allowedSectionCount, opt_sharedArray): Semaphore`**

Instantiate Semaphore.  
If opt_sharedArray is passed, this semaphore constructed from that SharedArrayBuffer.

*args*

* allowedSectionCount: The number which allowed to enter critical section,
* opt_sharedArray: Optional SharedArrayBuffer.


**`Semaphore.fromShared(sharedArray: SharedArrayBuffer, allowedSectionCount: number): Semaphore`**

Create Semaphore instance from existing SharedArrayBuffer.

*args*

* sharedArray: Constructed SharedArrayBuffer.
* allowedSectionCount: The number which allowed to enter critical section.


**`get Semaphore#shared(): SharedArrayBuffer`**

Return SharedArrayBuffer.  
This method often used in main thread.


**`Semaphore#signal()`**

Release occupied section.


## Mutex

*inherit Semaphore* 

**`Mutex(opt_sharedArray): Mutex`**

Instantiate Mutex.  
If opt_sharedArray is passed, this mutex constructed from that SharedArrayBuffer.

*args*

* opt_sharedArray: Optional SharedArrayBuffer.

**`Mutex.fromShared(sharedArray: SharedArrayBuffer): Mutex`**

Create Mutex instance from existing SharedArrayBuffer.

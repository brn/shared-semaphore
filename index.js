/**
 * @fileoverview SharedArrayBuffer based Semaphore implementation
 * @author Taketoshi Aono(brn)
 * 
 * Copyright 2017 Taketoshi Aono(brn)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software w*ithout restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.                                               *                                                                                                                                                                             
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */


/**
 * Semaaphore implementation class.
 */
class Semaphore {
  /**
   * Instantiate Semaphore.
   * If opt_sharedArray is passed, this semaphore constructed from that SharedArrayBuffer.
   * @param {number} allowedSectionCount The number which allowed to enter critical section.
   * @param {SharedArrayBuffer} opt_sharedArray Optional SharedArrayBuffer.
   */
  constructor(allowedSectionCount, opt_sharedArray) {
    const sab = opt_sharedArray || new SharedArrayBuffer(allowedSectionCount % 4 !== 0? allowedSectionCount * 4: allowedSectionCount);

    /**
     * @private {number} Enterable section count.
     */
    this._allowedSectionCount = allowedSectionCount;

    /**
     * @private {number}
     * Occupied section of this instance.
     */
    this._occupiedSection = -1;

    /**
     * @private {Int32Array} Int32Array which wrapped SharedArrayBuffer.
     */
    this._sab =  sab instanceof Int32Array? sab: new Int32Array(sab);
    this._acquire();
  }  

  
  /**
   * Create Semaphore instance from existing SharedArrayBuffer.
   * @param {SharedArrayBuffer} sharedArray Constructed SharedArrayBuffer.
   * @param {number} allowedSectionCount The number which allowed to enter critical section.
   * @returns {Semaphore} 
   */
  static fromShared(sharedArray, allowedSectionCount) {
    return new Semaphore(allowedSectionCount, sharedArray);
  }

  
  /**
   * Return SharedArrayBuffer.  
   * This method often used in main thread.
   * @returns {SharedArrayBuffer}
   * @example
   *
   * const worker = new Worker('...');
   * const semaphore = new Semaphore();
   * worker.postMessage({shared: semaphore.shared});
   */
  get shared() {
    return this._sab;
  }

  
  /**
   * Release occupied section.
   */
  signal() {
    const occupiedSection = this._occupiedSection;
    this._occupiedSection = -1;
    Atomics.store(this._sab, occupiedSection, 0);
  }

 
  /**
   * @private
   * Get SharedArrayBuffer section atomically.  
   * If can't get section, this method try to get section until section acquired.
   */
  _acquire() {
    while (1) {
      for (let i = 0; i < this._allowedSectionCount; i++) {
        if (Atomics.compareExchange(this._sab, i, 0, 1) === 0) {
          this._occupiedSection = i;
          return;
        }
      }
    }
  }
}


class Mutex extends Semaphore {
  constructor(opt_sharedArray) {
    super(1, opt_sharedArray);
  }
}

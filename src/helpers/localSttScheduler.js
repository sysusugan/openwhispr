const LOCAL_STT_PRIORITY = Object.freeze({
  UPLOAD: 10,
  HISTORY: 10,
  REALTIME: 100,
});

function createSchedulerError(code, message, details = {}) {
  return Object.assign(new Error(message), { code, ...details });
}

class LocalSttScheduler {
  constructor() {
    this.current = null;
    this.queue = [];
    this.nextId = 1;
    this.drainScheduled = false;
  }

  run(options, worker) {
    const priority = Number.isFinite(options?.priority)
      ? options.priority
      : LOCAL_STT_PRIORITY.UPLOAD;
    const task = {
      id: `${Date.now()}-${this.nextId++}`,
      kind: options?.kind || "unknown",
      priority,
      interruptible: options?.interruptible === true,
      controller: new AbortController(),
      externalSignal: options?.signal || null,
      cleanupExternalAbort: null,
      worker,
      resolve: null,
      reject: null,
    };

    const promise = new Promise((resolve, reject) => {
      task.resolve = resolve;
      task.reject = reject;
    });

    if (task.externalSignal?.aborted) {
      task.reject(task.externalSignal.reason || createSchedulerError("CANCELLED", "Cancelled"));
      return promise;
    }
    if (task.externalSignal) {
      const abortHandler = () => this._cancelTaskFromSignal(task, task.externalSignal);
      task.externalSignal.addEventListener("abort", abortHandler, { once: true });
      task.cleanupExternalAbort = () =>
        task.externalSignal.removeEventListener("abort", abortHandler);
    }

    this.queue.push(task);
    this._preemptIfNeeded(task);
    this._scheduleDrain();
    return promise;
  }

  getCurrent() {
    if (!this.current) return null;
    return {
      id: this.current.id,
      kind: this.current.kind,
      priority: this.current.priority,
      interruptible: this.current.interruptible,
    };
  }

  _preemptIfNeeded(incoming) {
    if (!this.current) return;
    if (!this.current.interruptible) return;
    if (incoming.priority <= this.current.priority) return;
    if (this.current.controller.signal.aborted) return;

    this.current.controller.abort(
      createSchedulerError(
        "UPLOAD_TRANSCRIPTION_PREEMPTED",
        "Upload transcription paused because realtime transcription needs local STT.",
        { preemptedBy: incoming.kind }
      )
    );
  }

  _cancelTaskFromSignal(task, signal) {
    const abortError = signal.reason || createSchedulerError("CANCELLED", "Cancelled");
    const queuedIndex = this.queue.indexOf(task);
    if (queuedIndex >= 0) {
      this.queue.splice(queuedIndex, 1);
      task.cleanupExternalAbort?.();
      task.reject(abortError);
      return;
    }

    if (this.current === task && !task.controller.signal.aborted) {
      task.controller.abort(abortError);
    }
  }

  _scheduleDrain() {
    if (this.drainScheduled) return;
    this.drainScheduled = true;
    setImmediate(() => {
      this.drainScheduled = false;
      void this._drain();
    });
  }

  async _drain() {
    if (this.current || this.queue.length === 0) return;

    const nextIndex = this._nextTaskIndex();
    const [task] = this.queue.splice(nextIndex, 1);
    this.current = task;

    try {
      const result = await task.worker({ signal: task.controller.signal, task });
      task.resolve(result);
    } catch (error) {
      task.reject(error);
    } finally {
      task.cleanupExternalAbort?.();
      if (this.current === task) {
        this.current = null;
      }
      this._scheduleDrain();
    }
  }

  _nextTaskIndex() {
    let bestIndex = 0;
    for (let i = 1; i < this.queue.length; i++) {
      if (this.queue[i].priority > this.queue[bestIndex].priority) {
        bestIndex = i;
      }
    }
    return bestIndex;
  }
}

module.exports = {
  LOCAL_STT_PRIORITY,
  LocalSttScheduler,
  createSchedulerError,
};

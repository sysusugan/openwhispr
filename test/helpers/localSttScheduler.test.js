const test = require("node:test");
const assert = require("node:assert/strict");

const { LOCAL_STT_PRIORITY, LocalSttScheduler } = require("../../src/helpers/localSttScheduler");

function tick() {
  return new Promise((resolve) => setImmediate(resolve));
}

test("local STT scheduler runs only one operation at a time", async () => {
  const scheduler = new LocalSttScheduler();
  const events = [];
  let releaseFirst;

  const first = scheduler.run(
    { kind: "upload", priority: LOCAL_STT_PRIORITY.UPLOAD, interruptible: true },
    async () => {
      events.push("first:start");
      await new Promise((resolve) => {
        releaseFirst = resolve;
      });
      events.push("first:end");
      return "first";
    }
  );

  const second = scheduler.run(
    { kind: "upload", priority: LOCAL_STT_PRIORITY.UPLOAD, interruptible: true },
    async () => {
      events.push("second:start");
      return "second";
    }
  );

  await tick();
  assert.deepEqual(events, ["first:start"]);

  releaseFirst();
  assert.equal(await first, "first");
  assert.equal(await second, "second");
  assert.deepEqual(events, ["first:start", "first:end", "second:start"]);
});

test("local STT scheduler lets realtime work preempt an active upload", async () => {
  const scheduler = new LocalSttScheduler();
  let abortReason = null;

  const upload = scheduler.run(
    { kind: "upload", priority: LOCAL_STT_PRIORITY.UPLOAD, interruptible: true },
    async ({ signal }) => {
      await new Promise((resolve, reject) => {
        signal.addEventListener(
          "abort",
          () => {
            abortReason = signal.reason;
            reject(signal.reason);
          },
          { once: true }
        );
      });
    }
  );

  await tick();

  const realtime = scheduler.run(
    { kind: "dictation", priority: LOCAL_STT_PRIORITY.REALTIME, interruptible: false },
    async () => "dictation"
  );

  await assert.rejects(upload, (error) => {
    assert.equal(error.code, "UPLOAD_TRANSCRIPTION_PREEMPTED");
    return true;
  });
  assert.equal(await realtime, "dictation");
  assert.equal(abortReason.code, "UPLOAD_TRANSCRIPTION_PREEMPTED");
});

test("local STT scheduler cancels queued work when its external signal aborts", async () => {
  const scheduler = new LocalSttScheduler();
  let releaseFirst;
  const queuedController = new AbortController();

  const first = scheduler.run(
    { kind: "dictation", priority: LOCAL_STT_PRIORITY.REALTIME, interruptible: false },
    async () => {
      await new Promise((resolve) => {
        releaseFirst = resolve;
      });
      return "first";
    }
  );

  const queued = scheduler.run(
    {
      kind: "upload",
      priority: LOCAL_STT_PRIORITY.UPLOAD,
      interruptible: true,
      signal: queuedController.signal,
    },
    async () => "queued"
  );

  await tick();
  queuedController.abort(Object.assign(new Error("cancelled"), { code: "CANCELLED" }));

  await assert.rejects(queued, (error) => {
    assert.equal(error.code, "CANCELLED");
    return true;
  });

  releaseFirst();
  assert.equal(await first, "first");
});

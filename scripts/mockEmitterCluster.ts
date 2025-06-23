// mockEmitterCluster.ts
// Simulates a VS Code-style event emitter cluster to test DisposableRegistry leak detection

import { EventEmitter } from "events";
import { DisposableRegistry } from "./DisposableRegistry";

const registry = new DisposableRegistry(true, 5); // Lower threshold for demo

// Simulate a cluster of emitters
const emitters = Array.from({ length: 3 }, () => new EventEmitter());

// Helper to create a disposable for EventEmitter
function on(
  emitter: EventEmitter,
  event: string,
  handler: (...args: unknown[]) => void
) {
  emitter.on(event, handler);
  return { dispose: () => emitter.removeListener(event, handler) };
}

// --- Demo block for dumpByLifecycle ---
const dummyDisposable = () => ({ dispose: () => {} });
registry.track(dummyDisposable(), {
  context: "test.onEarlyInitEvent",
  lifecyclePhase: "early-init",
});
registry.track(dummyDisposable(), {
  context: "test.onModelCreate",
  lifecyclePhase: "onDidCreateModel",
});
registry.track(dummyDisposable(), {
  context: "test.onPostReadyEvent",
  lifecyclePhase: "post-ready",
});
registry.dumpByLifecycle();

// --- Refactored emitter cluster with metadata-aware track ---
for (let i = 0; i < 3; i++) {
  registry.track(
    on(emitters[i], "data", () => {}),
    {
      context: `emitter[${i}].on(data)`,
      lifecyclePhase: i === 0 ? "early-init" : "onDidCreateModel",
    }
  );
  if (i % 2 === 0)
    registry.track(
      on(emitters[i], "data", () => {}),
      {
        context: `emitter[${i}].on(data)`,
        lifecyclePhase: "post-ready",
      }
    );
}
for (let i = 0; i < 12; i++) {
  registry.track(
    on(emitters[0], "leak", () => {}),
    {
      context: "emitter[0].on(leak)",
      lifecyclePhase: "early-init",
    }
  );
}

console.log("--- Heatmap ---");
registry.printHeatmap();

console.log("--- Warn if above threshold (5) ---");
registry.warnIfAbove(5);

console.log("--- Disposing all ---");
registry.disposeAll();

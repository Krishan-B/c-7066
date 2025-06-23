import { describe, expect, it, vi } from "vitest";
import { DisposableRegistry } from "../../scripts/DisposableRegistry";

const fakeDisposable = () => ({ dispose: vi.fn() });

describe("DisposableRegistry diagnostics", () => {
  it("tracks metadata and dumps lifecycle summary", () => {
    const registry = new DisposableRegistry();

    registry.track(fakeDisposable(), {
      context: "early.event",
      lifecyclePhase: "early-init",
    });

    registry.track(fakeDisposable(), {
      context: "model.create",
      lifecyclePhase: "onDidCreateModel",
    });

    registry.track(fakeDisposable(), {
      context: "model.create",
      lifecyclePhase: "onDidCreateModel",
    });

    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    registry.dumpByLifecycle();

    expect(spy).toHaveBeenCalledWith(
      expect.stringMatching(/Phase: early-init/)
    );
    expect(spy).toHaveBeenCalledWith(expect.stringMatching(/model.create: 2/));

    spy.mockRestore();
  });

  it("warns if too many listeners in a phase/context", () => {
    const registry = new DisposableRegistry();

    for (let i = 0; i < 5; i++) {
      registry.track(fakeDisposable(), {
        context: "bloat.test",
        lifecyclePhase: "early-init",
      });
    }

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    registry.warnIfTooMany(3);

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("High listener count")
    );
    expect(warnSpy.mock.calls[0][0]).toContain("bloat.test");

    warnSpy.mockRestore();
  });
});

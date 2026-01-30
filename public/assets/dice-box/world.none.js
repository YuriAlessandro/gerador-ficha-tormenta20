var R = Object.defineProperty;
var I = (t, e, o) => e in t ? R(t, e, { enumerable: !0, configurable: !0, writable: !0, value: o }) : t[e] = o;
var p = (t, e, o) => (I(t, typeof e != "symbol" ? e + "" : e, o), o), g = (t, e, o) => {
  if (!e.has(t))
    throw TypeError("Cannot " + o);
};
var s = (t, e, o) => (g(t, e, "read from private field"), o ? o.call(t) : e.get(t)), h = (t, e, o) => {
  if (e.has(t))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(t) : e.set(t, o);
}, c = (t, e, o, n) => (g(t, e, "write to private field"), n ? n.call(t, o) : e.set(t, o), o);
var u = (t, e, o, n) => ({
  set _(l) {
    c(t, e, l, o);
  },
  get _() {
    return s(t, e, n);
  }
});
import { D as C } from "./Dice.js";
import "./dice-box.es.js";
var v, i, d, a, m, f;
class P {
  constructor(e) {
    p(this, "config");
    h(this, v, void 0);
    p(this, "initialized", !1);
    h(this, i, {});
    h(this, d, 0);
    h(this, a, 0);
    h(this, m, []);
    h(this, f, void 0);
    p(this, "noop", () => {
    });
    this.onInitComplete = e.onInitComplete || this.noop, this.onThemeLoaded = e.onThemeLoaded || this.noop, this.onRollResult = e.onRollResult || this.noop, this.onRollComplete = e.onRollComplete || this.noop, this.onDieRemoved = e.onDieRemoved || this.noop, this.initialized = this.initScene(e);
  }
  async initScene(e) {
    this.config = e.options, this.onInitComplete();
  }
  resize() {
  }
  loadTheme() {
    return Promise.resolve();
  }
  updateConfig(e) {
    Object.assign(this.config, e);
  }
  addNonDie(e) {
    console.log("die", e), clearTimeout(s(this, f));
    const { id: o, value: n, ...l } = e, r = {
      id: o,
      value: n,
      config: l
    };
    s(this, i)[o] = r, s(this, m).push(setTimeout(() => {
      this.handleAsleep(r);
    }, u(this, d)._++ * this.config.delay)), c(this, f, setTimeout(() => {
      this.onRollComplete();
    }, 500));
  }
  add(e) {
    console.log("add die"), this.addNonDie(e);
  }
  remove(e) {
    console.log("remove die");
    const o = s(this, i)[e.id];
    o.hasOwnProperty("d10Instance") && (delete s(this, i)[o.d10Instance.id], u(this, a)._--), delete s(this, i)[e.id], u(this, a)._--, this.onDieRemoved(e.rollId);
  }
  clear() {
    !Object.keys(s(this, i)).length && !s(this, a) || (s(this, m).forEach((e) => clearTimeout(e)), Object.values(s(this, i)).forEach((e) => {
      e.mesh && e.mesh.dispose();
    }), c(this, i, {}), c(this, d, 0), c(this, a, 0));
  }
  // handle the position updates from the physics worker. It's a simple flat array of numbers for quick and easy transfer
  async handleAsleep(e) {
    var o, n;
    if (e.asleep = !0, await C.getRollResult(e), e.d10Instance || e.dieParent) {
      if ((o = e == null ? void 0 : e.d10Instance) != null && o.asleep || (n = e == null ? void 0 : e.dieParent) != null && n.asleep) {
        const l = e.config.sides === 100 ? e : e.dieParent, r = e.config.sides === 10 ? e : e.d10Instance;
        r.value === 0 && l.value === 0 ? l.value = 100 : l.value = l.value + r.value, this.onRollResult({
          rollId: l.config.rollId,
          value: l.value
        });
      }
    } else
      e.config.sides === 10 && e.value === 0 && (e.value = 10), this.onRollResult({
        rollId: e.config.rollId,
        value: e.value
      });
    u(this, a)._++;
  }
}
v = new WeakMap(), i = new WeakMap(), d = new WeakMap(), a = new WeakMap(), m = new WeakMap(), f = new WeakMap();
export {
  P as default
};
//# sourceMappingURL=world.none.js.map

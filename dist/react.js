import { jsx as f } from "react/jsx-runtime";
import { useRef as i, useEffect as l } from "react";
import { createParticularDrift as d } from "./particular-drift.js";
const v = {
  display: "block",
  height: "100%",
  width: "100%"
}, y = ({
  imageUrl: e,
  options: n,
  style: o,
  ...u
}) => {
  const s = i(null), t = i();
  return l(() => {
    const a = s.current;
    if (!a) return;
    let c = !1;
    return d(a, { ...n, imageUrl: e }).then((r) => {
      if (c) {
        r.destroy();
        return;
      }
      t.current = r;
    }), () => {
      var r;
      c = !0, (r = t.current) == null || r.destroy(), t.current = void 0;
    };
  }, [e, n]), /* @__PURE__ */ f(
    "canvas",
    {
      "aria-hidden": "true",
      ...u,
      ref: s,
      style: { ...v, ...o }
    }
  );
};
export {
  y as ParticularDriftCanvas
};

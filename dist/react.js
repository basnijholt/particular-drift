import { jsx as v } from "react/jsx-runtime";
import { useRef as l, useEffect as h } from "react";
import { createParticularDrift as o } from "./particular-drift.js";
const d = {
  display: "block",
  height: "100%",
  width: "100%"
}, x = ({
  imageUrl: i,
  onRendererError: a,
  options: f,
  style: n,
  ...r
}) => {
  const u = l(null), c = l();
  return h(() => {
    const e = u.current;
    if (!e) return;
    let s = !1;
    return o(e, { ...f, imageUrl: i }).then((t) => {
      if (s) {
        t.destroy();
        return;
      }
      c.current = t;
    }).catch((t) => {
      s || a == null || a(t);
    }), () => {
      var t;
      s = !0, (t = c.current) == null || t.destroy(), c.current = void 0;
    };
  }, [i, a, f]), /* @__PURE__ */ v(
    "canvas",
    {
      "aria-hidden": "true",
      ...r,
      ref: u,
      style: { ...d, ...n }
    }
  );
};
export {
  x as ParticularDriftCanvas
};

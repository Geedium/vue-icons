import { h } from "vue";

export const Icon = (props, paths, circles = []) => {
  return h(
    "svg",
    {
      viewBox: "0 0 24 24",
      style: {
        width: `${props?.width || 24}px`,
        height: `${props?.height || 24}px`,
      },
    },
    [
      ...paths.map((path) => {
        return h("path", {
          fill: "currentColor",
          d: path,
        });
      }),
      ...circles.map((circle) => {
        return h("circle", {
          fill: "currentColor",
          cx: circle.cx,
          cy: circle.cy,
          r: circle.r,
        });
      }),
    ]
  );
};

export * from "./mui.js";

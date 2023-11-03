import React from "react";
import { Circle } from "react-konva";
import isNull from "../../utils/isNull";
import pointModes from "../../constants/pointModes";

/**Нарисовать звено */
const DrawNode = ({ x, y, mode }) => {
  let fill = "#ffffff";
  let radius = 3;
  let stroke = "#ff0000";
  let strokeWidth = 1;
  if (mode === pointModes.select) {
    fill = "#ff0000";
    radius = 6;
    stroke = "#00ff00";
    strokeWidth = 2;
  } else if (mode === pointModes.addLine) {
    fill = "#00ff00";
    radius = 10;
    stroke = "#0000ff";
    strokeWidth = 2;
  } else if (mode === pointModes.add) {
    fill = "#0000ff";
    radius = 10;
    stroke = "#00ffff";
    strokeWidth = 2;
  } else if (mode === pointModes.group) {
    fill = "#ff00ff";
    radius = 7;
    stroke = "#00ff00";
    strokeWidth = 3;
  } else if (mode === pointModes.rotate) {
    fill = "#ffff00";
    radius = 13;
    stroke = "#00ff00";
    strokeWidth = 5;
  } else if (mode === pointModes.transform) {
    fill = "#ffffff";
    radius = 4;
    stroke = "#0000ff";
    strokeWidth = 2;
  } else if (mode === pointModes.extrusion) {
    fill = "#000000";
    radius = 6;
    stroke = "#ff0000";
    strokeWidth = 3;
  }

  return (
    <Circle
      x={x}
      y={y}
      fill={fill}
      radius={radius}
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  );
};

export default DrawNode;

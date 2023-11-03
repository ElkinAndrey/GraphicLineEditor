import React from "react";
import { Line } from "react-konva";
import branchModes from "../../constants/branchModes";

const DrawBranch = ({ points, mode }) => {
  let stroke = "#ffffff";
  let strokeWidth = 1;
  let dash = null;
  if (mode === branchModes.select) {
    stroke = "#ff0000";
    strokeWidth = 4;
    dash = null;
  } else if (mode === branchModes.transform) {
    stroke = "#0000ff";
    strokeWidth = 3;
    dash = null;
  } else if (mode === branchModes.forwardAxisX) {
    stroke = "#00b200";
    strokeWidth = 1;
    dash = null;
  } else if (mode === branchModes.forwardAxisY) {
    stroke = "#0000b2";
    strokeWidth = 1;
    dash = null;
  } else if (mode === branchModes.forwardAxisZ) {
    stroke = "#b20000";
    strokeWidth = 1;
    dash = null;
  } else if (mode === branchModes.backAxisX) {
    stroke = "#00b200";
    strokeWidth = 1;
    dash = [3, 3];
  } else if (mode === branchModes.backAxisY) {
    stroke = "#0000b2";
    strokeWidth = 1;
    dash = [3, 3];
  } else if (mode === branchModes.backAxisZ) {
    stroke = "#b20000";
    strokeWidth = 1;
    dash = [3, 3];
  }
  return (
    <Line
      points={points}
      stroke={stroke}
      strokeWidth={strokeWidth}
      dash={dash}
      // perfectDrawEnabled={false} // Отключить размытие
    />
  );
};

export default DrawBranch;

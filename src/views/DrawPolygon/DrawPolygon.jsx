import React from "react";
import { Line } from "react-konva";

const DrawPolygon = ({ cord, color }) => {
  return (
    <Line
      points={cord}
      fill={color}
      stroke={color}
      strokeWidth={0}
      closed={true}
    />
  );
};

export default DrawPolygon;

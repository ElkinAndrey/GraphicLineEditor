import React from "react";
import { Line } from "react-konva";

/**Задний фон */
const Background = ({ width, height, color }) => {
  return (
    <Line
      points={[0, 0, width, 0, width, height, 0, height]}
      fill={color}
      stroke={color}
      strokeWidth={0}
      closed={true}
    />
  );
};

export default Background;

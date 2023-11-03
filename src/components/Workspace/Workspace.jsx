import React, { useEffect, useState } from "react";
import { Stage, Layer, Line, Text, Circle } from "react-konva";
import Background from "../../views/Background/Background";
import DrawNode from "../../views/DrawNode/DrawNode";
import Node from "../../domain/Node";
import mul from "../../utils/mul";
import modes from "../../constants/modes";
import pointModes from "../../constants/pointModes";
import isNull from "../../utils/isNull";
import Branch from "../../domain/Branch";
import DrawBranch from "../../views/DrawBranch/DrawBranch";
import branchModes from "../../constants/branchModes";
import nullTransformWalls from "../../constants/nullTransformWalls";
import DrawPolygon from "../../views/DrawPolygon/DrawPolygon";

let select = null;
let addLineNode = null;
let selectBranch = null;

const Workspace = ({
  width,
  height,
  nodes,
  setNodes,
  mode,
  setChangeNode,
  branches,
  setBranches,
  addedNode,
  setAddedNode,
  groupNodes,
  setGroupNodes,
  rotateNode,
  setRotateNode,
  groupAngels,
  distance,
  setDistance,
  transformWalls,
  setTransformWalls,
  setStartTransformWalls,
  showNodes,
  extrusionNodes,
}) => {
  // КОНСТАНТЫ
  const rotationalSpeed = 0.3;
  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);
  const size = 1000;
  const rad = 57.29577951308232;

  const axes = [
    new Branch(
      new Node(0, 0, 0),
      new Node(1, 0, 0, pointModes.standart, true),
      branchModes.forwardAxisX
    ),
    new Branch(
      new Node(0, 0, 0),
      new Node(0, 1, 0, pointModes.standart, true),
      branchModes.forwardAxisY
    ),
    new Branch(
      new Node(0, 0, 0),
      new Node(0, 0, 1, pointModes.standart, true),
      branchModes.forwardAxisZ
    ),
    new Branch(
      new Node(0, 0, 0),
      new Node(-1, 0, 0, pointModes.standart, true),
      branchModes.backAxisX
    ),
    new Branch(
      new Node(0, 0, 0),
      new Node(0, -1, 0, pointModes.standart, true),
      branchModes.backAxisY
    ),
    new Branch(
      new Node(0, 0, 0),
      new Node(0, 0, -1, pointModes.standart, true),
      branchModes.backAxisZ
    ),
  ];

  // ПЕРЕМЕННЫЕ

  const [angleX, setAngleX] = useState(30);
  const [angleY, setAngleY] = useState(30);
  const [transformNodes, setTransformNodes] = useState([]);
  const [transformBranches, setTransformBranches] = useState([]);

  // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ

  const cos = (angle) => Math.cos(angle / rad);
  const sin = (angle) => Math.sin(angle / rad);
  const tan = (angle) => Math.tan(angle / rad);
  const cot = (angle) => 1 / Math.tan(angle / rad);
  const screenX = (x) => Math.floor(x * size + centerX);
  const screenY = (y) => Math.floor(-y * size + centerY);

  // МАТРИЦЫ

  let rotateX = [
    [1, 0, 0, 0],
    [0, cos(angleX), sin(angleX), 0],
    [0, -sin(angleX), cos(angleX), 0],
    [0, 0, 0, 1],
  ];

  let rotateY = [
    [cos(angleY), 0, -sin(angleY), 0],
    [0, 1, 0, 0],
    [sin(angleY), 0, cos(angleY), 0],
    [0, 0, 0, 1],
  ];

  let perspective = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, -1 / distance],
    [0, 0, 0, 1],
  ];

  let scale = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, distance],
  ];

  // let complexMatrix = mul(mul(mul(rotateY, rotateX), perspective), scale);
  let complexMatrix = mul(mul(mul(rotateY, rotateX), perspective), scale);

  // ФУНКЦИИ

  /** Вращение сцены */
  const stageRotation = (e) => {
    const startX = e.evt.clientX;
    const startY = e.evt.clientY;
    const startAngleX = angleX;
    const startAngleY = angleY;

    document.onmousemove = (e) => {
      setAngleX(startAngleX + (e.clientY - startY) * rotationalSpeed);
      setAngleY(startAngleY + (e.clientX - startX) * rotationalSpeed);
    };

    document.onmouseup = () => {
      document.onmousemove = null;
      document.onmouseup = null;
    };
  };

  /** Найти рядом */
  const nearNode = (clientX, clientY) => {
    const selRadius = 15;

    let params = null;
    nodes.forEach((node) => {
      let cord = node.convert(complexMatrix);
      let scX = screenX(cord.x);
      let scY = screenY(cord.y);
      let distans = ((scX - clientX) ** 2 + (scY - clientY) ** 2) ** 0.5;

      if (distans > selRadius) return;

      if (
        isNull(params) ||
        params.nearDistans > distans ||
        (params.nearDistans === distans && cord.z > params.z)
      ) {
        params = {
          nearNode: node,
          nearDistans: distans,
          z: cord.z,
        };
      }
    });
    return params?.nearNode;
  };

  /** Выбрать звено */
  const selectNode = (e) => {
    let near = nearNode(e.evt.layerX, e.evt.layerY);

    if (!isNull(near)) {
      if (near.mode !== pointModes.standart && near.mode !== pointModes.select)
        return;
      near.mode = pointModes.select;
      if (near !== select && !isNull(select)) select.mode = pointModes.standart;
      select = near;
    } else if (!isNull(select)) {
      if (
        select.mode === pointModes.standart ||
        select.mode === pointModes.select
      )
        select.mode = pointModes.standart;
      select = null;
    }

    setNodes([...nodes]);
  };

  /** Ветка рядом */
  const branchNearby = (x, y) => {
    let curDistance = null;
    let curBranch = null;
    let maxDistance = 15;
    [...branches].forEach((b) => {
      let startCord = b.start.convert(complexMatrix);
      let endCord = b.end.convert(complexMatrix);
      let xo = x;
      let xa = screenX(startCord.x);
      let xb = screenX(endCord.x);
      let yo = y;
      let ya = screenY(startCord.y);
      let yb = screenY(endCord.y);
      let t =
        ((xo - xa) * (xb - xa) + (yo - ya) * (yb - ya)) /
        ((xb - xa) * (xb - xa) + (yb - ya) * (yb - ya));

      if (t < 0) t = 0;
      if (t > 1) t = 1;

      let distance =
        ((xa - xo + (xb - xa) * t) ** 2 + (ya - yo + (yb - ya) * t) ** 2) **
        0.5;

      if (distance > maxDistance) return;
      if (curBranch === null || distance < curDistance) {
        curDistance = distance;
        curBranch = b;
      }
    });
    return curBranch;
  };

  /** Выбрать линию */
  const selectLine = (e) => {
    let near = branchNearby(e.evt.layerX, e.evt.layerY);

    if (!isNull(near)) {
      if (
        near.mode !== branchModes.standart &&
        near.mode !== branchModes.select
      )
        return;
      near.mode = branchModes.select;
      if (near !== selectBranch && !isNull(selectBranch))
        selectBranch.mode = branchModes.standart;
      selectBranch = near;
    } else if (!isNull(selectBranch)) {
      if (
        selectBranch.mode === branchModes.standart ||
        selectBranch.mode === branchModes.select
      )
        selectBranch.mode = branchModes.standart;
      selectBranch = null;
    }

    setBranches([...branches]);
  };

  /** Удалить звено */
  const deleteNode = (e) => {
    let near = nearNode(e.evt.layerX, e.evt.layerY);
    if (!isNull(near)) {
      setBranches(
        branches.filter(
          (branch) => branch.start !== near && branch.end !== near
        )
      );
      setNodes(nodes.filter((node) => node !== near));
    }
  };

  /** Удалить звено */
  const changeNode = (e) => {
    let near = nearNode(e.evt.layerX, e.evt.layerY);
    if (!isNull(near)) setChangeNode(near);
  };

  /** Добавить линию */
  const addLine = (e) => {
    let near = nearNode(e.evt.layerX, e.evt.layerY);
    if (isNull(near)) return;

    if (isNull(addLineNode)) {
      near.mode = pointModes.addLine;
      addLineNode = near;
      setNodes([...nodes]);
      return;
    }

    if (near === addLineNode) {
      near.mode = pointModes.select;
      addLineNode = null;
      setNodes([...nodes]);
      return;
    }

    setBranches([...branches, new Branch(addLineNode, near)]);
    addLineNode.mode = pointModes.standart;
    addLineNode = null;
    setNodes([...nodes]);
  };

  /** Удалить звено */
  const deleteLine = (e) => {
    let near = branchNearby(e.evt.layerX, e.evt.layerY);
    if (!isNull(near)) {
      setBranches(branches.filter((branch) => branch !== near));
    }
  };

  /** Групировать */
  const groupPoints = (e) => {
    let near = nearNode(e.evt.layerX, e.evt.layerY);
    if (isNull(near)) return;
    let index = groupNodes.indexOf(near);
    if (index === -1) {
      near.mode = pointModes.group;
      groupNodes.push(near);
      setGroupNodes([...groupNodes]);
      setNodes([...nodes]);
    } else {
      near.mode = pointModes.select;
      groupNodes.splice(index, 1);
      setGroupNodes([...groupNodes]);
      setNodes([...nodes]);
    }
  };

  const changeRotateNode = (e) => {
    let near = nearNode(e.evt.layerX, e.evt.layerY);
    if (isNull(near)) return;
    let newRN = rotateNode.copy();
    newRN.x = near.x;
    newRN.y = near.y;
    newRN.z = near.z;
    setRotateNode(newRN);
  };

  const setAddPoint = (e) => {
    let near = nearNode(e.evt.layerX, e.evt.layerY);
    if (!isNull(near)) {
      addedNode.x = near.x;
      addedNode.y = near.y;
      addedNode.z = near.z;
      setAddedNode(addedNode.copy());
    }
  };

  /** При нажатии */
  const onClick = (e) => {
    if (e.evt.button === 0) {
      if (mode === modes.addPoint) setAddPoint(e);
      if (mode === modes.rotate) stageRotation(e);
      if (mode === modes.deletePoint) deleteNode(e);
      if (mode === modes.changePoint) changeNode(e);
      if (mode === modes.addLine) addLine(e);
      if (mode === modes.deleteLine) deleteLine(e);
      if (mode === modes.group) groupPoints(e);
      if (mode === modes.groupRotate) changeRotateNode(e);
    } else if (e.evt.button === 1) {
      stageRotation(e);
    }
  };

  /** При движении */
  const onMove = (e) => {
    if (
      mode === modes.deletePoint ||
      mode === modes.changePoint ||
      mode === modes.addLine ||
      mode === modes.group
    )
      selectNode(e);
    if (mode === modes.deleteLine) selectLine(e);
  };

  /** При кручении колесика */
  const onWheel = (e) => {
    if (e.evt.deltaY < 0) {
      setDistance(distance * 0.9);
    } else if (e.evt.deltaY > 0) {
      setDistance(distance * 1.111111111111111111111);
    }
  };

  const minIndex = (arr) => {
    let m = 0;
    for (let i = 1; i < arr.length; ++i) {
      if (arr[m] > arr[i]) {
        m = i;
      }
    }
    return m;
  };

  const getFloorCord = () => {
    let endCoordinatesMatrix = axes.map((axis) => {
      return axis.end.convert(complexMatrix);
    });

    let ECMF = [
      {
        x: screenX(endCoordinatesMatrix[0].x),
        y: screenY(endCoordinatesMatrix[0].y),
        z: endCoordinatesMatrix[0].z,
      },
      {
        x: screenX(endCoordinatesMatrix[2].x),
        y: screenY(endCoordinatesMatrix[2].y),
        z: endCoordinatesMatrix[2].z,
      },
      {
        x: screenX(endCoordinatesMatrix[3].x),
        y: screenY(endCoordinatesMatrix[3].y),
        z: endCoordinatesMatrix[3].z,
      },
      {
        x: screenX(endCoordinatesMatrix[5].x),
        y: screenY(endCoordinatesMatrix[5].y),
        z: endCoordinatesMatrix[5].z,
      },
    ];

    let h = ECMF[minIndex(ECMF.map((e) => e.z))].y;
    if (endCoordinatesMatrix[1].y > 0) {
      return [0, h, width, h, width, height, 0, height];
    } else {
      return [0, 0, width, 0, width, h, 0, h];
    }
  };

  useEffect(() => {
    let rX = [
      [1, 0, 0, 0],
      [0, cos(groupAngels.x), sin(groupAngels.x), 0],
      [0, -sin(groupAngels.x), cos(groupAngels.x), 0],
      [0, 0, 0, 1],
    ];
    let rY = [
      [cos(groupAngels.y), 0, -sin(groupAngels.y), 0],
      [0, 1, 0, 0],
      [sin(groupAngels.y), 0, cos(groupAngels.y), 0],
      [0, 0, 0, 1],
    ];
    let rZ = [
      [cos(groupAngels.z), sin(groupAngels.z), 0, 0],
      [-sin(groupAngels.z), cos(groupAngels.z), 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ];
    groupNodes.forEach((n) => {
      if (isNull(n.oldNode)) n.oldNode = n.copy();
      let cord = [
        [
          n.oldNode.x - rotateNode.x,
          n.oldNode.y - rotateNode.y,
          n.oldNode.z - rotateNode.z,
          1,
        ],
      ];
      cord = mul(mul(mul(cord, rX), rY), rZ);
      n.x = cord[0][0] + rotateNode.x;
      n.y = cord[0][1] + rotateNode.y;
      n.z = cord[0][2] + rotateNode.z;
    });
    setNodes([...nodes]);
  }, [groupAngels]);

  useEffect(() => {
    if (mode !== modes.transformGroup || groupNodes.length <= 1) {
      setGroupNodes(
        groupNodes.map((g) => {
          g.oldNode = null;
          return g;
        })
      );
      setTransformNodes([]);
      setTransformBranches([]);
      setTransformWalls(nullTransformWalls);
      return;
    }

    groupNodes[0].oldNode = groupNodes[0].copy();
    let minX = groupNodes[0].x;
    let minY = groupNodes[0].y;
    let minZ = groupNodes[0].z;
    let maxX = groupNodes[0].x;
    let maxY = groupNodes[0].y;
    let maxZ = groupNodes[0].z;
    for (let i = 1; i < groupNodes.length; i++) {
      groupNodes[i].oldNode = groupNodes[i].copy();
      if (groupNodes[i].x < minX) minX = groupNodes[i].x;
      if (groupNodes[i].y < minY) minY = groupNodes[i].y;
      if (groupNodes[i].z < minZ) minZ = groupNodes[i].z;
      if (groupNodes[i].x > maxX) maxX = groupNodes[i].x;
      if (groupNodes[i].y > maxY) maxY = groupNodes[i].y;
      if (groupNodes[i].z > maxZ) maxZ = groupNodes[i].z;
    }
    let ns = [
      new Node(minX, minY, minZ, pointModes.transform),
      new Node(minX, minY, maxZ, pointModes.transform),
      new Node(maxX, minY, maxZ, pointModes.transform),
      new Node(maxX, minY, minZ, pointModes.transform),
      new Node(minX, maxY, minZ, pointModes.transform),
      new Node(minX, maxY, maxZ, pointModes.transform),
      new Node(maxX, maxY, maxZ, pointModes.transform),
      new Node(maxX, maxY, minZ, pointModes.transform),
    ];
    setTransformNodes(ns);
    setTransformBranches([
      new Branch(ns[0], ns[1], branchModes.transform),
      new Branch(ns[1], ns[2], branchModes.transform),
      new Branch(ns[2], ns[3], branchModes.transform),
      new Branch(ns[3], ns[0], branchModes.transform),
      new Branch(ns[4], ns[5], branchModes.transform),
      new Branch(ns[5], ns[6], branchModes.transform),
      new Branch(ns[6], ns[7], branchModes.transform),
      new Branch(ns[7], ns[4], branchModes.transform),
      new Branch(ns[0], ns[4], branchModes.transform),
      new Branch(ns[1], ns[5], branchModes.transform),
      new Branch(ns[2], ns[6], branchModes.transform),
      new Branch(ns[3], ns[7], branchModes.transform),
    ]);
    let tw = {
      minX: minX,
      minY: minY,
      minZ: minZ,
      maxX: maxX,
      maxY: maxY,
      maxZ: maxZ,
    };
    setTransformWalls(tw);
    setStartTransformWalls(tw);
    setGroupNodes([...groupNodes]);
  }, [mode]);

  useEffect(() => {
    let tw = transformWalls;
    if (transformNodes.length === 8) {
      transformNodes[0].setPosition(tw.minX, tw.minY, tw.minZ);
      transformNodes[1].setPosition(tw.minX, tw.minY, tw.maxZ);
      transformNodes[2].setPosition(tw.maxX, tw.minY, tw.maxZ);
      transformNodes[3].setPosition(tw.maxX, tw.minY, tw.minZ);
      transformNodes[4].setPosition(tw.minX, tw.maxY, tw.minZ);
      transformNodes[5].setPosition(tw.minX, tw.maxY, tw.maxZ);
      transformNodes[6].setPosition(tw.maxX, tw.maxY, tw.maxZ);
      transformNodes[7].setPosition(tw.maxX, tw.maxY, tw.minZ);
      setTransformNodes([...transformNodes]);
    }
  }, [transformWalls]);

  return (
    <div>
      <Stage
        width={width}
        height={height}
        onMouseDown={onClick}
        onMouseMove={onMove}
        onWheel={onWheel}
      >
        <Layer>
          <Background width={width} height={height} color={"#3e3e3e"} />

          <DrawPolygon cord={getFloorCord()} color={"#5f5b63"} />

          {axes.map((axis, index) => {
            let startCord = axis.start.convert(complexMatrix);
            let endCord = axis.end.convert(complexMatrix);
            return (
              <DrawBranch
                key={index}
                points={[
                  screenX(startCord.x),
                  screenY(startCord.y),
                  screenX(endCord.x),
                  screenY(endCord.y),
                ]}
                mode={axis.mode}
              />
            );
          })}

          {branches.map((branch, index) => {
            let startCord = branch.start.convert(complexMatrix);
            let endCord = branch.end.convert(complexMatrix);
            return (
              <DrawBranch
                key={index}
                points={[
                  screenX(startCord.x),
                  screenY(startCord.y),
                  screenX(endCord.x),
                  screenY(endCord.y),
                ]}
                mode={branch.mode}
              />
            );
          })}

          {mode === modes.addPoint && (
            <DrawNode
              x={screenX(addedNode.convert(complexMatrix).x)}
              y={screenY(addedNode.convert(complexMatrix).y)}
              mode={addedNode.mode}
            />
          )}

          {showNodes &&
            nodes
              .map((node) => node.convert(complexMatrix))
              .sort((n1, n2) => n1.z - n2.z)
              .map((node, index) => (
                <DrawNode
                  x={screenX(node.x)}
                  y={screenY(node.y)}
                  mode={node.mode}
                  key={index}
                />
              ))}

          {mode === modes.groupRotate && (
            <DrawNode
              x={screenX(rotateNode.convert(complexMatrix).x)}
              y={screenY(rotateNode.convert(complexMatrix).y)}
              mode={rotateNode.mode}
            />
          )}

          {mode === modes.transformGroup && (
            <>
              {transformBranches.map((branch, index) => {
                let startCord = branch.start.convert(complexMatrix);
                let endCord = branch.end.convert(complexMatrix);
                return (
                  <DrawBranch
                    key={index}
                    points={[
                      screenX(startCord.x),
                      screenY(startCord.y),
                      screenX(endCord.x),
                      screenY(endCord.y),
                    ]}
                    mode={branch.mode}
                  />
                );
              })}
              {transformNodes
                .map((node) => node.convert(complexMatrix))
                .sort((n1, n2) => n1.z - n2.z)
                .map((node, index) => (
                  <DrawNode
                    x={screenX(node.x)}
                    y={screenY(node.y)}
                    mode={node.mode}
                    key={index}
                  />
                ))}
            </>
          )}

          {mode === modes.extrusionGroup &&
            extrusionNodes.map((n) => (
              <DrawNode
                x={screenX(n.convert(complexMatrix).x)}
                y={screenY(n.convert(complexMatrix).y)}
                mode={n.mode}
              />
            ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default Workspace;

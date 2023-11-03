import { useEffect, useState } from "react";
import "./App.css";
import Tools from "./components/Tools/Tools";
import Workspace from "./components/Workspace/Workspace";
import Node from "./domain/Node";
import modes from "./constants/modes";
import pointModes from "./constants/pointModes";
import Branch from "./domain/Branch";
import nullTransformWalls from "./constants/nullTransformWalls";

function App() {
  // КОНСТАНТЫ
  const toolsWidth = 250;

  // ПЕРЕМЕННЫЕ
  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);
  const [mode, setMode] = useState(modes.rotate);
  const [nodes, setNodes] = useState([
    new Node(0, 0, 8),
    new Node(5, 0, 8),
    new Node(5, 0, 0),
    new Node(0, 0, 0),
    new Node(3, 10, 8),
    new Node(3, 10, 0),
    new Node(2, 0, 8),
    new Node(2, 2, 8),
    new Node(4, 2, 8),
    new Node(4, 0, 8),
    new Node(5, 2, 6),
    new Node(5, 2, 2),
    new Node(5, 4, 2),
    new Node(5, 4, 6),
    new Node(0, 5, 8),
    new Node(5, 5, 8),
    new Node(5, 5, 0),
    new Node(0, 5, 0),
  ]);
  const [branches, setBranches] = useState([]);
  const [changeNode, setChangeNode] = useState(null);
  const [addedNode, setAddedNode] = useState(new Node(0, 0, 0, pointModes.add));
  const [groupNodes, setGroupNodes] = useState([]);
  const [rotateNode, setRotateNode] = useState(
    new Node(0, 0, 0, pointModes.rotate)
  );
  const [groupAngels, setGroupAngels] = useState({ x: 0, y: 0, z: 0 });
  const [distance, setDistance] = useState(30); // Растояние до камеры
  const [startTransformWalls, setStartTransformWalls] =
    useState(nullTransformWalls);
  const [transformWalls, setTransformWalls] = useState(nullTransformWalls);
  const [showNodes, setShowNodes] = useState(true);
  const [extrusionNodes, setExtrusionNodes] = useState([]);

  // ФУНКЦИИ

  /** Изменение размера рабочей области */
  window.addEventListener("resize", () => {
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);
  });

  /** Добавить звено */
  const addNode = (node) => {
    for (let i = 0; i < nodes.length; i++) if (node.equals(nodes[i])) return;
    setNodes([...nodes, node]);
  };

  /** Перезагрузить */
  const reboot = () => {
    setNodes([...nodes]);
  };

  /** Очистить группу */
  const allInGroup = () => {
    setGroupNodes(
      nodes.map((g) => {
        g.mode = pointModes.group;
        return g;
      })
    );
    reboot();
  };

  /** Очистить группу */
  const clearGroup = () => {
    groupNodes.forEach((g) => {
      g.mode = pointModes.standart;
    });
    setGroupNodes([]);
    reboot();
  };

  /** Применить поворот */
  const applyRotation = () => {
    groupNodes.forEach((n) => {
      n.oldNode = null;
    });
    reboot();
    setGroupAngels({ x: 0, y: 0, z: 0 });
  };

  const createTextByModel = () => {
    let text = "";
    nodes.forEach((n) => {
      text += `n ${n.x} ${n.y} ${n.z}\n`;
    });
    text += "\n";
    branches.forEach((b) => {
      text += `b ${nodes.indexOf(b.start)} ${nodes.indexOf(b.end)}\n`;
    });
    return text;
  };

  const createModelByText = (text) => {
    let mas = text.split("\n");
    let newNodes = [];
    let newBranches = [];

    mas.forEach((el) => {
      let els = el.split(" ");
      if (els[0] === "n") {
        newNodes.push(new Node(Number(els[1]), Number(els[2]), Number(els[3])));
      } else if (els[0] === "b") {
        newBranches.push([Number(els[1]), Number(els[2])]);
      }
    });

    newBranches = newBranches.map(
      (e) => new Branch(newNodes[e[0]], newNodes[e[1]])
    );

    reset();
    setNodes(newNodes);
    setBranches(newBranches);
  };

  const reset = () => {
    setMode(modes.rotate);
    setNodes([]);
    setBranches([]);
    setChangeNode(null);
    setAddedNode(new Node(0, 0, 0, pointModes.add));
    setGroupNodes([]);
    setRotateNode(new Node(0, 0, 0, pointModes.rotate));
    setGroupAngels({ x: 0, y: 0, z: 0 });
    setDistance(30);
    setStartTransformWalls(nullTransformWalls);
    setTransformWalls(nullTransformWalls);
    setExtrusionNodes([]);
  };

  /** При изменении угла поворота */
  useEffect(() => {
    applyRotation();
  }, [rotateNode]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        background: "#363636",
      }}
    >
      <Tools
        width={toolsWidth}
        addNode={addNode}
        mode={mode}
        setMode={setMode}
        reboot={reboot}
        changeNode={changeNode}
        addedNode={addedNode}
        setAddedNode={setAddedNode}
        allInGroup={allInGroup}
        clearGroup={clearGroup}
        groupNodes={groupNodes}
        rotateNode={rotateNode}
        setRotateNode={setRotateNode}
        groupAngels={groupAngels}
        setGroupAngels={setGroupAngels}
        applyRotation={applyRotation}
        distance={distance}
        transformWalls={transformWalls}
        setTransformWalls={setTransformWalls}
        startTransformWalls={startTransformWalls}
        createTextByModel={createTextByModel}
        createModelByText={createModelByText}
        reset={reset}
        showNodes={showNodes}
        setShowNodes={setShowNodes}
        extrusionNodes={extrusionNodes}
        setExtrusionNodes={setExtrusionNodes}
        nodes={nodes}
        setNodes={setNodes}
        setGroupNodes={setGroupNodes}
      />
      <Workspace
        width={width - toolsWidth}
        height={height}
        nodes={nodes}
        setNodes={setNodes}
        mode={mode}
        setChangeNode={setChangeNode}
        branches={branches}
        setBranches={setBranches}
        addedNode={addedNode}
        setAddedNode={setAddedNode}
        groupNodes={groupNodes}
        setGroupNodes={setGroupNodes}
        rotateNode={rotateNode}
        setRotateNode={setRotateNode}
        groupAngels={groupAngels}
        distance={distance}
        setDistance={setDistance}
        transformWalls={transformWalls}
        setTransformWalls={setTransformWalls}
        setStartTransformWalls={setStartTransformWalls}
        showNodes={showNodes}
        extrusionNodes={extrusionNodes}
      />
    </div>
  );
}

export default App;

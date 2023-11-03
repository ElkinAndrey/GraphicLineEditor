import React, { useEffect, useState } from "react";
import Node from "../../domain/Node";
import modes from "../../constants/modes";
import isNull from "../../utils/isNull";
import pointModes from "../../constants/pointModes";
import InputFloat from "../../views/InputFloat/InputFloat";
import ReadFile from "../../views/ReadFile/ReadFile";

const ModeButtons = ({ modeButtons }) => {
  return (
    <div>
      {modeButtons.map((m, index) => (
        <div key={index}>
          <button disabled={m.disabled} onClick={m.click}>
            {m.name}
          </button>
        </div>
      ))}
    </div>
  );
};

const Tools = ({
  width,
  addNode,
  mode,
  setMode,
  reboot,
  changeNode,
  addedNode,
  setAddedNode,
  allInGroup,
  clearGroup,
  groupNodes,
  rotateNode,
  setRotateNode,
  groupAngels,
  setGroupAngels,
  applyRotation,
  distance,
  transformWalls,
  setTransformWalls,
  startTransformWalls,
  createTextByModel,
  createModelByText,
  reset,
  showNodes,
  setShowNodes,
  extrusionNodes,
  setExtrusionNodes,
  nodes,
  setNodes,
  setGroupNodes,
}) => {
  const [groupMoving, setGroupMoving] = useState({ x: 0, y: 0, z: 0 });
  const modeButtons = [
    {
      disabled: mode === modes.rotate,
      click: () => {
        setMode(modes.rotate);
      },
      name: "Вращать",
    },
    {
      disabled: mode === modes.addPoint,
      click: () => {
        setMode(modes.addPoint);
      },
      name: "Добавить точку",
    },
    {
      disabled: mode === modes.deletePoint,
      click: () => {
        setMode(modes.deletePoint);
      },
      name: "Удалить точку",
    },
    {
      disabled: mode === modes.changePoint,
      click: () => {
        setMode(modes.changePoint);
      },
      name: "Изменить точку",
    },
    {
      disabled: mode === modes.addLine,
      click: () => {
        setMode(modes.addLine);
      },
      name: "Добавить линию",
    },
    {
      disabled: mode === modes.deleteLine,
      click: () => {
        setMode(modes.deleteLine);
      },
      name: "Удалить линию",
    },
    {
      disabled: mode === modes.group,
      click: () => {
        setMode(modes.group);
      },
      name: "Групировать",
    },
    {
      disabled: mode === modes.groupMove,
      click: () => {
        setMode(modes.groupMove);
      },
      name: "Перемещение группы",
    },
    {
      disabled: mode === modes.groupRotate,
      click: () => {
        setMode(modes.groupRotate);
      },
      name: "Вращение группы",
    },
    {
      disabled: mode === modes.transformGroup,
      click: () => {
        setMode(modes.transformGroup);
      },
      name: "Трансформирование",
    },
    {
      disabled: mode === modes.extrusionGroup,
      click: () => {
        setMode(modes.extrusionGroup);
      },
      name: "Выдавливание",
    },
  ];

  const [extrusionNodesOffset, setExtrusionNodesOffset] = useState({
    x: 0,
    y: 0,
    z: 0,
  });

  const setTrancform = (minX, maxX, minY, maxY, minZ, maxZ) => {
    let STW = startTransformWalls;
    let kx = (maxX - minX) / (STW.maxX - STW.minX);
    let ky = (maxY - minY) / (STW.maxY - STW.minY);
    let kz = (maxZ - minZ) / (STW.maxZ - STW.minZ);

    if (isNaN(kx)) kx = 1;
    if (isNaN(ky)) ky = 1;
    if (isNaN(kz)) kz = 1;

    groupNodes.forEach((g) => {
      g.x = (g.oldNode.x - STW.minX) * kx + minX;
      g.y = (g.oldNode.y - STW.minY) * ky + minY;
      g.z = (g.oldNode.z - STW.minZ) * kz + minZ;
    });
  };

  /** Скачать файл */
  const downloadFile = (text, name) => {
    const url = window.URL.createObjectURL(new Blob([text]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", name);
    document.body.appendChild(link);
    link.click();
  };

  useEffect(() => {
    if (
      extrusionNodesOffset.x === 0 &&
      extrusionNodesOffset.y === 0 &&
      extrusionNodesOffset.z === 0
    ) {
      setExtrusionNodes([]);
      return;
    }

    setExtrusionNodes(
      groupNodes.map((n) => {
        let newNode = n.copy();
        newNode.x += extrusionNodesOffset.x;
        newNode.y += extrusionNodesOffset.y;
        newNode.z += extrusionNodesOffset.z;
        newNode.mode = pointModes.extrusion;
        return newNode;
      })
    );
  }, [extrusionNodesOffset]);

  return (
    <div
      style={{
        width: `${width}px`,
        minWidth: `${width}px`,
        maxWidth: `${width}px`,
        position: "relative",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          right: "10px",
          minHeight: "calc(100% - 40px)",
          background: "#3e3e3e",
          borderRadius: "7px",
          padding: "10px 20px",
        }}
      >
        <h3>Выбрать режим</h3>
        <div>
          Показывать точки{" "}
          <input
            type="checkbox"
            checked={showNodes}
            onChange={() => setShowNodes(!showNodes)}
          />
        </div>
        <br />
        <ModeButtons modeButtons={modeButtons} />
        <br />
        <div>
          <div>
            <button
              onClick={() => {
                let text = createTextByModel();
                downloadFile(text, "Модель.txt");
              }}
            >
              Сохранить
            </button>
          </div>
          <div>
            <ReadFile
              id={"1"}
              setText={(text) => {
                createModelByText(text);
              }}
            />
          </div>
          <div>
            <button
              onClick={() => {
                reset();
              }}
            >
              Очистить
            </button>
          </div>
        </div>

        <div style={mode === modes.addPoint ? {} : { display: "none" }}>
          <h3>Добавление точки</h3>
          <InputFloat
            value={addedNode.x}
            setValue={(value) => {
              addedNode.x = value;
              setAddedNode(addedNode.copy());
            }}
            step={distance / 60}
          />
          <InputFloat
            value={addedNode.y}
            setValue={(value) => {
              addedNode.y = value;
              setAddedNode(addedNode.copy());
            }}
            step={distance / 60}
          />
          <InputFloat
            value={addedNode.z}
            setValue={(value) => {
              addedNode.z = value;
              setAddedNode(addedNode.copy());
            }}
            step={distance / 60}
          />
          <button
            onClick={() => {
              addedNode.mode = pointModes.standart;
              addNode(addedNode);
              setAddedNode(
                new Node(addedNode.x, addedNode.y, addedNode.z, pointModes.add)
              );
            }}
          >
            Добавить
          </button>
        </div>

        <div
          style={
            mode === modes.changePoint && !isNull(changeNode)
              ? {}
              : { display: "none" }
          }
        >
          <h3>Измение точки</h3>
          <InputFloat
            value={changeNode?.x ?? 0}
            setValue={(value) => {
              changeNode.x = value;
              reboot();
            }}
            step={distance / 60}
          />
          <InputFloat
            value={changeNode?.y ?? 0}
            setValue={(value) => {
              changeNode.y = value;
              reboot();
            }}
            step={distance / 60}
          />
          <InputFloat
            value={changeNode?.z ?? 0}
            setValue={(value) => {
              changeNode.z = value;
              reboot();
            }}
            step={distance / 60}
          />
        </div>

        <div style={mode === modes.group ? {} : { display: "none" }}>
          <h3>Групировка</h3>
          <button
            onClick={() => {
              allInGroup();
            }}
          >
            Выбрать все
          </button>
          <button
            onClick={() => {
              clearGroup();
            }}
          >
            Очистить
          </button>
        </div>

        <div style={mode === modes.groupMove ? {} : { display: "none" }}>
          <h3>Перемещение группы</h3>
          <InputFloat
            value={groupMoving.x}
            setValue={(value) => {
              groupNodes.forEach((g) => {
                g.x += value - groupMoving.x;
              });
              reboot();
              groupMoving.x = value;
              setGroupMoving(groupMoving);
            }}
            step={distance / 60}
          />
          <InputFloat
            value={groupMoving.y}
            setValue={(value) => {
              groupNodes.forEach((g) => {
                g.y += value - groupMoving.y;
              });
              reboot();
              groupMoving.y = value;
              setGroupMoving(groupMoving);
            }}
            step={distance / 60}
          />
          <InputFloat
            value={groupMoving.z}
            setValue={(value) => {
              groupNodes.forEach((g) => {
                g.z += value - groupMoving.z;
              });
              reboot();
              groupMoving.z = value;
              setGroupMoving(groupMoving);
            }}
            step={distance / 60}
          />
          <button
            onClick={() => {
              setGroupMoving({ x: 0, y: 0, z: 0 });
            }}
          >
            Применить
          </button>
        </div>

        <div style={mode === modes.groupRotate ? {} : { display: "none" }}>
          <h3>Поворот группы</h3>
          <h4>Точка поворота</h4>

          <InputFloat
            value={rotateNode.x}
            setValue={(value) => {
              rotateNode.x = value;
              setRotateNode(rotateNode.copy());
            }}
            step={distance / 60}
          />
          <InputFloat
            value={rotateNode.y}
            setValue={(value) => {
              rotateNode.y = value;
              setRotateNode(rotateNode.copy());
            }}
            step={distance / 60}
          />
          <InputFloat
            value={rotateNode.z}
            setValue={(value) => {
              rotateNode.z = value;
              setRotateNode(rotateNode.copy());
            }}
            step={distance / 60}
          />
          <h4>Углы поворота</h4>
          <input
            type="range"
            min="0"
            max="360"
            value={groupAngels.x}
            onChange={(e) =>
              setGroupAngels({ ...groupAngels, x: Number(e.target.value) })
            }
          />
          <label>{groupAngels.x}</label>
          <input
            type="range"
            min="0"
            max="360"
            value={groupAngels.y}
            onChange={(e) =>
              setGroupAngels({ ...groupAngels, y: Number(e.target.value) })
            }
          />
          <label>{groupAngels.y}</label>
          <input
            type="range"
            min="0"
            max="360"
            value={groupAngels.z}
            onChange={(e) =>
              setGroupAngels({ ...groupAngels, z: Number(e.target.value) })
            }
          />
          <label>{groupAngels.z}</label>
          <button onClick={() => applyRotation()}>Применить</button>
        </div>

        <div style={mode === modes.transformGroup ? {} : { display: "none" }}>
          <h3>Трансформирование</h3>
          <h4>x</h4>
          <InputFloat
            value={transformWalls.minX}
            setValue={(value) => {
              let tv = transformWalls;
              setTrancform(value, tv.maxX, tv.minY, tv.maxY, tv.minZ, tv.maxZ);
              setTransformWalls({ ...transformWalls, minX: value });
            }}
            step={distance / 60}
            disabled={startTransformWalls.maxX === startTransformWalls.minX}
          />
          <InputFloat
            value={transformWalls.maxX}
            setValue={(value) => {
              let tv = transformWalls;
              setTrancform(tv.minX, value, tv.minY, tv.maxY, tv.minZ, tv.maxZ);
              setTransformWalls({ ...transformWalls, maxX: value });
            }}
            step={distance / 60}
            disabled={startTransformWalls.maxX === startTransformWalls.minX}
          />
          <div>
            <select
              disabled={startTransformWalls.maxX === startTransformWalls.minX}
              onChange={(e) => {
                let t = transformWalls;
                let max = t.maxX;
                let min = t.minX;
                if (e.target.value === "1") {
                  let c = max;
                  max = min;
                  min = c;
                } else if (e.target.value === "2") {
                  min = 2 * max - min;
                } else if (e.target.value === "3") {
                  max = 2 * min - max;
                } else if (e.target.value === "4") {
                  max = -max;
                  min = -min;
                } else {
                  return;
                }
                setTrancform(min, max, t.minY, t.maxY, t.minZ, t.maxZ);
                setTransformWalls({ ...t, minX: min, maxX: max });
              }}
              value={"0"}
            >
              <option value="0" disabled>
                --Зеркалирование--
              </option>
              <option value="1">Перевернуть</option>
              <option value="2">Отзеркалить спереди</option>
              <option value="3">Отзеркалить сзади</option>
              <option value="4">Отзеркалить по оси</option>
            </select>
          </div>

          <h4>y</h4>
          <InputFloat
            value={transformWalls.minY}
            setValue={(value) => {
              let tv = transformWalls;
              setTrancform(tv.minX, tv.maxX, value, tv.maxY, tv.minZ, tv.maxZ);
              setTransformWalls({ ...transformWalls, minY: value });
            }}
            step={distance / 60}
            disabled={startTransformWalls.maxY === startTransformWalls.minY}
          />
          <InputFloat
            value={transformWalls.maxY}
            setValue={(value) => {
              let tv = transformWalls;
              setTrancform(tv.minX, tv.maxX, tv.minY, value, tv.minZ, tv.maxZ);
              setTransformWalls({ ...transformWalls, maxY: value });
            }}
            step={distance / 60}
            disabled={startTransformWalls.maxY === startTransformWalls.minY}
          />
          <div>
            <select
              disabled={startTransformWalls.maxY === startTransformWalls.minY}
              onChange={(e) => {
                let t = transformWalls;
                let max = t.maxY;
                let min = t.minY;
                if (e.target.value === "1") {
                  let c = max;
                  max = min;
                  min = c;
                } else if (e.target.value === "2") {
                  min = 2 * max - min;
                } else if (e.target.value === "3") {
                  max = 2 * min - max;
                } else if (e.target.value === "4") {
                  max = -max;
                  min = -min;
                } else {
                  return;
                }
                setTrancform(t.minX, t.maxX, min, max, t.minZ, t.maxZ);
                setTransformWalls({ ...t, minY: min, maxY: max });
              }}
              value={"0"}
            >
              <option value="0" disabled>
                --Зеркалирование--
              </option>
              <option value="1">Перевернуть</option>
              <option value="2">Отзеркалить спереди</option>
              <option value="3">Отзеркалить сзади</option>
              <option value="4">Отзеркалить по оси</option>
            </select>
          </div>

          <h4>z</h4>
          <InputFloat
            value={transformWalls.minZ}
            setValue={(value) => {
              let tv = transformWalls;
              setTrancform(tv.minX, tv.maxX, tv.minY, tv.maxY, value, tv.maxZ);
              setTransformWalls({ ...transformWalls, minZ: value });
            }}
            step={distance / 60}
            disabled={startTransformWalls.maxZ === startTransformWalls.minZ}
          />
          <InputFloat
            value={transformWalls.maxZ}
            setValue={(value) => {
              let tv = transformWalls;
              setTrancform(tv.minX, tv.maxX, tv.minY, tv.maxY, tv.minZ, value);
              setTransformWalls({ ...transformWalls, maxZ: value });
            }}
            step={distance / 60}
            disabled={startTransformWalls.maxZ === startTransformWalls.minZ}
          />
          <div>
            <select
              disabled={startTransformWalls.maxZ === startTransformWalls.minZ}
              onChange={(e) => {
                let t = transformWalls;
                let max = t.maxZ;
                let min = t.minZ;
                if (e.target.value === "1") {
                  let c = max;
                  max = min;
                  min = c;
                } else if (e.target.value === "2") {
                  min = 2 * max - min;
                } else if (e.target.value === "3") {
                  max = 2 * min - max;
                } else if (e.target.value === "4") {
                  max = -max;
                  min = -min;
                } else {
                  return;
                }
                setTrancform(t.minX, t.maxX, t.minY, t.maxY, min, max);
                setTransformWalls({ ...t, minZ: min, maxZ: max });
              }}
              value={"0"}
            >
              <option value="0" disabled>
                --Зеркалирование--
              </option>
              <option value="1">Перевернуть</option>
              <option value="2">Отзеркалить спереди</option>
              <option value="3">Отзеркалить сзади</option>
              <option value="4">Отзеркалить по оси</option>
            </select>
          </div>
        </div>

        <div style={mode === modes.extrusionGroup ? {} : { display: "none" }}>
          <h3>Выдавливание</h3>
          <InputFloat
            value={extrusionNodesOffset.x}
            setValue={(value) =>
              setExtrusionNodesOffset({ ...extrusionNodesOffset, x: value })
            }
            step={distance / 60}
          />
          <InputFloat
            value={extrusionNodesOffset.y}
            setValue={(value) =>
              setExtrusionNodesOffset({ ...extrusionNodesOffset, y: value })
            }
            step={distance / 60}
          />
          <InputFloat
            value={extrusionNodesOffset.z}
            setValue={(value) =>
              setExtrusionNodesOffset({ ...extrusionNodesOffset, z: value })
            }
            step={distance / 60}
          />
          <button
            onClick={() => {
              extrusionNodes.forEach((ex) => {
                ex.mode = pointModes.group;
              });
              groupNodes.forEach((ex) => {
                ex.mode = pointModes.standart;
              });
              setNodes([...nodes, ...extrusionNodes]);
              setGroupNodes([...extrusionNodes]);
              setExtrusionNodes([]);
              setExtrusionNodesOffset({ x: 0, y: 0, z: 0 });
            }}
          >
            Добавить
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tools;

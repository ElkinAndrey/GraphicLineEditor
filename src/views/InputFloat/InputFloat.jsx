import React, { useEffect, useRef, useState } from "react";

let FCS = null;
let FCE = null;

const InputFloat = ({
  value,
  setValue,
  decimalPlaces = 2,
  step = 1,
  disabled = false,
}) => {
  // ПЕРЕМЕННЫЕ

  const ref = useRef(null);
  const [text, setText] = useState(`${value}`);
  const [realStep, setRealStep] = useState(step);

  // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ

  /** Округлить */
  const round = (num, decimalPlaces) =>
    Math.round(num * 10 ** decimalPlaces) / 10 ** decimalPlaces;

  /** Есть ли точка в строке */
  const pointPosition = (str) => {
    for (let i = 0; i < str.length; i++)
      if (str[i] === "." || str[i] === ",") return i;
    return -1;
  };

  /** Собрать из трех частей одну */
  const makeCorrectString = (left, center, right) => {
    let chars = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    let masStr = [];

    // Если символы добавляются
    if (center.length !== 0) {
      // Если добавляется в начало, а в начале уже есть минус, то удалить минус
      if (left.length === 0 && right[0] === "-")
        right = right.substring(1, right.length);

      // Проверить, была ли точка в строке
      let hasDot = pointPosition(left + right) !== -1;

      // Если строка добавляется в начало и первый символ
      // строки это минус, то добавить в начало и перейти на следующий символ
      let i = 0;
      if (left.length === 0 && center[0] === "-") {
        masStr.push(center[0]);
        i++;
      }

      // Проверить все символы
      for (; i < center.length; i++) {
        if (chars.indexOf(center[i]) !== -1) {
          masStr.push(center[i]);
        } else if (!hasDot && (center[i] === "," || center[i] === ".")) {
          hasDot = true;
          masStr.push(center[i]);
        }
      }
    }

    return left + masStr.join("") + right;
  };

  // ФУНКЦИИ ПРИ ИЗМЕНЕНИИ

  useEffect(() => {
    if (decimalPlaces === null) setRealStep(step);
    else setRealStep(round(step, decimalPlaces));
  }, [step]);

  useEffect(() => {
    setText(`${value}`);
  }, [value]);

  // ФУНКЦИИ СОБЫТИЙ

  /** При нажатии кнопки у Input */
  const onKeyDown = () => {
    FCS = ref.current.selectionStart;
    FCE = ref.current.selectionEnd;
  };

  /** При изменении у Input */
  const onChange = (e) => {
    const v = e.target.value;
    const LCS = ref.current.selectionStart;
    const LCE = ref.current.selectionEnd;

    let left = LCS >= FCS ? text.slice(0, FCS) : text.slice(0, LCS);
    let center = v.slice(FCS, LCE);
    let right =
      LCE !== FCE ? text.slice(FCE, text.length) : v.slice(LCE, v.length);

    let newStr = makeCorrectString(left, center, right);
    let newNum = Number(newStr.replace(",", "."));
    if (decimalPlaces !== null) newNum = round(newNum, decimalPlaces);

    setText(newStr);
    setValue(newNum);
  };

  /** Прибавить к числу */
  const addValue = (num) => {
    let newValue = value + num;
    if (decimalPlaces !== null) newValue = round(newValue, decimalPlaces);
    setText(`${newValue}`);
    setValue(newValue);
  };

  /** Прибавить к числу */
  const addValueToHold = (num, e) => {
    const button = 0;
    if (e.button !== button) return;

    let start = 300;
    let speed = 50;
    let t1;
    let repits = 0;

    const repeat = () => {
      t1 = setTimeout(repeat, speed);
      repits++;
      addValue(num * repits);
    };
    let t2 = setTimeout(repeat, start);

    document.onmouseup = (e) => {
      if (e.button !== button) return;
      document.onmouseup = null;
      clearTimeout(t1);
      clearTimeout(t2);
    };
  };

  /** При нажатии на кнопку уменьшения */
  const onClickDecrease = () => addValue(-realStep);

  /** При нажатии на кнопку увеличения */
  const onClickIncrease = () => addValue(realStep);

  /** При нажатии и удерживании на кнопку уменьшения */
  const onClickAndHoldDecrease = (e) => addValueToHold(-realStep * 2, e);

  /** При нажатии и удерживании на кнопку увеличения */
  const onClickAndHoldIncrease = (e) => addValueToHold(realStep * 2, e);

  return (
    <div>
      <button
        onClick={onClickDecrease}
        onMouseDown={onClickAndHoldDecrease}
        disabled={disabled}
      >
        {"<"}
      </button>
      <input
        type={"text"}
        ref={ref}
        value={text}
        onKeyDown={onKeyDown}
        onChange={onChange}
        onBlur={(e) => {
          addValue(0);
        }}
        disabled={disabled}
        style={{ width: "100px" }}
      />
      <button
        onClick={onClickIncrease}
        onMouseDown={onClickAndHoldIncrease}
        disabled={disabled}
      >
        {">"}
      </button>
    </div>
  );
};

export default InputFloat;

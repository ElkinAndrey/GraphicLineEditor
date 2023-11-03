import React, { useRef, useState } from "react";

const ReadFile = ({ setText, id }) => {
  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState(null);
  const [fileNotSelected, setFileNotSelected] = useState(false);

  const readerFile = (file, callback) => {
    const fr = new FileReader();
    fr.onload = () => callback(null, fr.result);
    fr.onerror = (err) => callback(err);
    fr.readAsText(file);
  };
  let ref = useRef(null);

  const addFile = (e) => {
    if (e.target.files && e.target.files[0]) {
      let f = e.target.files[0];
      setFileName(f.name);
      const reader = new FileReader();
      reader.onload = (x) => {
        setFile(f);
        readerFile(f, (err, res) => {
          setText(res);
          ref.current.value = "";
        });
      };
      reader.readAsDataURL(f);
      setFileNotSelected(false);
    }
  };

  return (
    <div>
      <label
        htmlFor={`formIdFile${id}`}
        style={{
          display: "inline-block",
          background: "#363636",
          color: "#d4d4d4",
          fontFamily: "Arial",
          border: "1px solid #5f5b63",
          borderRadius: "5px",
          padding: "5px 10px",
          marginTop: "10px",
          fontSize: "14px",
        }}
      >
        <input
          ref={ref}
          name=""
          type="file"
          onInput={addFile}
          id={`formIdFile${id}`}
          hidden
        />
        Выбрать Файл
      </label>
    </div>
  );
};

export default ReadFile;

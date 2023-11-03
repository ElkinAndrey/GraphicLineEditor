const mul = (matrix1, matrix2) => {
  if (matrix1.length === 0 || matrix2.length === 0) return [];
  if (matrix1[0].length !== matrix2.length) return [];

  let newMatrix = new Array(matrix1.length);
  for (let i = 0; i < matrix1.length; i++) {
    newMatrix[i] = new Array(matrix2[0].length);
  }

  for (let i = 0; i < matrix1.length; i++)
    for (let j = 0; j < matrix2[0].length; j++) {
      newMatrix[i][j] = Number(0);
      for (let k = 0; k < matrix2.length; k++) {
        newMatrix[i][j] += matrix1[i][k] * matrix2[k][j];
      }
    }
  return newMatrix;
};

export default mul;

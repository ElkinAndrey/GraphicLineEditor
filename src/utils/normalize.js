const normalize = (matrix) =>
  matrix.map((m) => {
    const maxNum = 10;
    const abs = (num) => (num >= 0 ? num : -num);

    if (m[m.length - 1] > 0) return m.map((num) => num / m[m.length - 1]);
    else {
      let max = abs(m[0]) > abs(m[1]) ? m[0] : m[1];
      if (max !== 0) m = m.map((num) => (maxNum * num) / abs(max));
      m[m.length - 1] = 1;
      return m;
    }
  });

export default normalize;

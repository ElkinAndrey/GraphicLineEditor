import pointModes from "../constants/pointModes";
import mul from "../utils/mul";
import normalize from "../utils/normalize";

/**Звено */
class Node {
  constructor(x, y, z, mode = pointModes.standart, infinity = false) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.mode = mode;
    this.infinity = infinity;
    this.branches = [];
    this.oldNode = null;
  }

  equals(node) {
    return node.x === this.x && node.y === this.y && node.z === this.z;
  }

  convert(matrix) {
    let finalMatrix = mul(
      [[this.x, this.y, this.z, this.infinity ? 0 : 1]],
      matrix
    );
    finalMatrix = normalize(finalMatrix);
    return {
      x: finalMatrix[0][0],
      y: finalMatrix[0][1],
      z: finalMatrix[0][2],
      mode: this.mode,
    };
  }

  copy() {
    return new Node(this.x, this.y, this.z, this.mode);
  }

  setPosition(newX, newY, newZ) {
    this.x = newX;
    this.y = newY;
    this.z = newZ;
  }
}

export default Node;

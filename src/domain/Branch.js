import branchModes from "../constants/branchModes";

class Branch {
  constructor(start, end, mode = branchModes.standart) {
    this.start = start;
    this.end = end;
    this.mode = mode;
    start.branches.push(this);
    end.branches.push(this);
  }
}

export default Branch;

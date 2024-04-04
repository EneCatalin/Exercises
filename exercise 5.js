String.prototype.add = function () {
  const numbers = this.split(",").map(Number);
  return numbers.reduce((acc, curr) => acc + curr, 0);
};

String.prototype.mul = function () {
  const numbers = this.split(",").map(Number);
  return numbers.reduce((acc, curr) => acc * curr, 1);
};

console.log("1,2,3,4".add()); // prints 10
console.log("1,2,3,4".mul()); // prints 24

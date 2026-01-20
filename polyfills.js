// Polyfill for Array.prototype.toReversed for React Native compatibility
if (!Array.prototype.toReversed) {
  Array.prototype.toReversed = function() {
    return this.slice().reverse();
  };
}

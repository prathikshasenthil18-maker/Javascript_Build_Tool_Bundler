function renderButton(label) {
  return "[button:" + String(label || "click") + "]";
}
module.exports = { renderButton };

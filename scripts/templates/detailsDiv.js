module.exports = function(messageText, helper) {
  return `
    <div class="col-md-1"></div>
    <div class="col-md-9">
      <p class="element answer text-secondary">${messageText}</p>
    </div>
    <div class="col-md-2">
      <p class="element helper text-center text-secondary">${helper}</p>
    </div>
  `
}

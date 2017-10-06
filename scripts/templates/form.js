module.exports = function(id) {
  return `<div class="col-md-8">
      <textarea class="form-control" id="answer-${id}" rows="3" placeholder="Tell us what the solution was"></textarea>
    </div>
    <div class="col-md-2">
      <input type="text" class="form-control" id="helper-${id}" aria-describedby="who helped you" placeholder="who helped you?">
    </div>
    <div class="col-md-2 d-flex flex-column align-items-center">
      <button type="button" id="archive-${id}" class="btn item-button btn-secondary btn-sm">Archive</button>
    </div>`
}

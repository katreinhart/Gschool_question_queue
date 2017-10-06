module.exports = function(id, index, name, question) {

    return `
    <div class="d-flex row">
        <div class="col-md-1 d-flex justify-content-center align-items-center">
          <p class="element queueNum">${index}</p>
        </div>
        <div class="col-md-3 d-flex align-items-center">
          <p class="element name">${name}</p>
        </div>
        <div class="col-md-6 d-flex align-items-center">
          <p class="element topic">${question}</p>
        </div>
        <div class="col-md-2 d-flex flex-column align-items-center justify-content-center">
          <button type="button" id="${id}-edit" class="btn item-button btn-primary btn-sm mt-2">Edit</button>
          <button type="button" id="${id}-answered" class="btn item-button btn-success btn-sm my-2">Answered</button>
        </div>
      </div>
      `

}

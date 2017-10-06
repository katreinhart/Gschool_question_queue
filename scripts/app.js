// const css = require('../styles/app.scss') // eslint-disable-line
const config = require('./config').config
// const uiconfig = require('./config').uiconfig
// console.log(uiconfig)
const firebase = require('firebase')
// const firebaseui = require('firebaseui')

const templates = require('./templates')

let username
firebase.initializeApp(config)
// let user = firebase.auth().currentUser
let database = firebase.database()

function getAllRequests () {
  database.ref('requests/').on('value', snapshot => {
    let result = snapshot.val()
    const ids = Object.keys(result)
    const queue = document.getElementById('queue')
    const queueSpot = document.getElementById('queueSpot')
    let queueNum = 0

    queue.innerHTML = ''
    const openQuestions = ids.filter(id => !result[id].resolved)
    openQuestions.forEach((id, index) => {
      const item = result[id]

      queue.appendChild(createNewListItem(id, index + 1, item.name, item.question))
      const answeredButton = document.getElementById(`${id}-answered`)
      const editButton = document.getElementById(`${id}-edit`)
      const questionText = document.getElementById(`${id}-question`)
      editButton.addEventListener('click', e => {
        if (editButton.textContent === 'Edit') {
          editButton.textContent = 'Save'
          const input = document.createElement('INPUT')
          input.style.width = '100%'
          input.id = `${id}-edit-input`

          input.value = item.question
          questionText.textContent = ''
          questionText.appendChild(input)

          answeredButton.classList.toggle('disabled')
        } else {
          editButton.textContent = 'Edit'
          answeredButton.classList.toggle('disabled')
          const input = document.getElementById(`${id}-edit-input`)

          database.ref('requests/' + id).update({
            question: input.value
          })
          questionText.textContent = input.value
        }
      })
      if ((item.name === username) && (queueNum === 0)) {
        queueNum = index + 1
        queueSpot.textContent = queueNum
        window.localStorage.setItem('place', queueNum)
        answeredButton.classList.toggle('disabled')
        editButton.classList.toggle('disabled')
      }

      answeredButton.addEventListener('click', e => {
        if (answeredButton.textContent === 'Answered') {
          // do stuff
          answeredButton.textContent = 'Cancel'
          answeredButton.className = 'btn item-button btn-warning btn-sm my-2'

          const li = e.target.closest('LI')
          const form = document.createElement('FORM')
          form.id = `${id}-form`
          form.className = 'form-group d-flex row my-2'
          form.innerHTML = templates.form(id)
          li.appendChild(form)
          document.getElementById(`archive-${id}`).addEventListener('click', e => {
            const helperForm = document.getElementById(`helper-${id}`)
            const solutionForm = document.getElementById(`answer-${id}`)
            if ((solutionForm.value !== '') && (helperForm.value !== '')) {
              markAsResolved(id, solutionForm.value, helperForm.value)
            } else if (solutionForm.value === '') {
              window.alert('Please let us know what the solution was.')
            } else if (helperForm.value === '') {
              window.alert('Please let us know who helped you.')
            }
          })
        } else {
          answeredButton.textContent = 'Answered'
          answeredButton.className = 'btn item-button btn-success btn-sm my-2'
          document.getElementById(`${id}-form`).remove()
        }
      })
    })
  })
}

function createNewListItem (id, index, name, question) {
  const newListItem = document.createElement('LI')
  newListItem.id = id
  // newListItem.className = 'row entry py-2'
  newListItem.innerHTML = templates.newListItem(id, index, name, question)
  return newListItem
}

function createNewArchiveListItem (id, index, name, question) {
  const newListItem = document.createElement('LI')
  newListItem.id = id
  // newListItem.className = 'row entry py-2'
  newListItem.innerHTML = templates.newArchiveListItem(id, index, name, question)
  return newListItem
}

function submitMessage (messageContent, userName) {
  const submitButton = document.getElementById('add-request')
  let uid = Date.now() + userName
  database.ref('requests/' + uid).set({
    _id: uid,
    name: userName,
    question: messageContent,
    resolved: false
  }).then(function () {
    // popup the success
    submitButton.classList.toggle('disabled')
    window.localStorage.setItem('canPost', false)
  }).catch(function (error) {
    console.error(error)
  })
}

function markAsResolved (id, resolutionMessage, helper) {
  database.ref('requests/' + id).update({
    resolved: true
  }).then(function () {
    database.ref('requests/' + id).once('value', function (snapshot) {
      let name = snapshot.val().name
      let question = snapshot.val().question
      database.ref('archive/' + id).set({
        'name': name,
        'question': question,
        'resolution': resolutionMessage,
        'helper': helper,
        'id': id
      })
      window.localStorage.setItem('canPost', true)
      document.getElementById('add-request').classList.toggle('disabled')
    // }).then(function () {
    //   // database.ref('requests/' + id).set(null)
    })
  }).catch(function (err) {
    console.error(err)
  })
}

function displayArchivedQuestions () {
  // let message = {}
  database.ref('archive/').on('value', function (snapshot) {
    let result = snapshot.val()
    const messageIds = Object.keys(result)

    const archive = document.getElementById('archive')
    archive.innerHTML = ''
    messageIds.sort(function (a, b) {
      return (a < b)
    })
    messageIds.forEach((id, index) => {
      const item = result[id]
      const newItem = createNewArchiveListItem(id, index + 1, item.name, item.question)
      archive.appendChild(newItem)
      const detailsButton = document.getElementById(`${id}-details`)
      detailsButton.addEventListener('click', () => { displayDetails(id, detailsButton) })
    })
  })
}

function displayDetails (id, detailsButton) {
  if (detailsButton.textContent === 'Details') {
    detailsButton.textContent = 'Collapse'
    const detailsDiv = document.createElement('DIV')
    detailsDiv.id = `${id}-detail-div`
    detailsDiv.className = 'form-group d-flex row my-2'
    detailsDiv.innerHTML = templates.detailsDiv()
    const li = detailsButton.closest('LI')
    li.appendChild(detailsDiv)
  } else {
    detailsButton.textContent = 'Details'
    document.getElementById(`${id}-detail-div`).remove()
  }
}

function detect () {
  let repeatUser = window.localStorage.getItem('repeatUser')
  if (repeatUser) {
    window.location.href = 'askify.html'
  }
}

if (window.route === 'index') {
  // do login page stuff
  let userInfo = {}
  let submit = document.getElementById('submit')

  detect()

  submit.addEventListener('click', function (e) {
    e.preventDefault()
    userInfo['fname'] = document.getElementById('fname').value
    userInfo['lname'] = document.getElementById('lname').value
    userInfo['email'] = document.getElementById('email').value
    window.localStorage.setItem('repeatUser', 'yes')
    window.localStorage.setItem('userFName', document.getElementById('fname').value)
    window.location.href = 'askify.html'
    window.localStorage.setItem('repeatUser', 'yes')
    window.localStorage.setItem('user', JSON.stringify(userInfo))
    window.localStorage.setItem('canPost', true)
    window.location.href = 'askify.html'
  })
} else if (window.route === 'askify') {
  let userInfo = JSON.parse(window.localStorage.getItem('user'))
  username = userInfo.fname
  const submitButton = document.getElementById('add-request')
  const messageTextField = document.getElementById('message-text')
  const greetingDiv = document.getElementById('greeting')
  greetingDiv.textContent = `Hello, ${userInfo.fname}!`
  if (window.localStorage.getItem('canPost') === 'false') {
    document.getElementById('add-request').classList.toggle('disabled')
  }

  submitButton.addEventListener('click', e => {
    let messageText = messageTextField.value
    if (messageText !== '') {
      submitMessage(messageText, userInfo.fname)
      messageTextField.value = ''
    }
  })
  getAllRequests()
} else if (window.route === 'archive') {
  let userInfo = JSON.parse(window.localStorage.getItem('user'))
  const greetingDiv = document.getElementById('greeting')
  const queueNum = document.getElementById('queueSpot')
  queueNum.textContent = window.localStorage.getItem('place')
  greetingDiv.textContent = `Hello, ${userInfo.fname}!`
  displayArchivedQuestions()
}

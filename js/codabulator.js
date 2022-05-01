const app = {
  codeElement: document.querySelector('.code'),
  codeMarks: [],
  codeString: '', //Raw code string
  notesElement: document.querySelector('.notes'),
}

async function init () {
  await renderCode()
  await renderMarkdown()
  renderNotes()
}
init()

async function renderCode () {
  let codeString
  //TODO: get url from data-src in html
  const response = await fetch('data/something.html')
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${ response.status }`)
  }
  codeString = await response.text()
  app.codeString = codeString
  app.codeElement.innerHTML = '<code class="code-source"></code>'
  app.codeElement.firstElementChild.textContent = codeString
}

async function renderMarkdown () {
  let markdownText
  const response = await fetch('data/something.md')
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`)
  }
  markdownText = await response.text()
  const html = marked.parse(markdownText);
  app.notesElement.innerHTML = html
}

function renderNotes () {
  const links = app.notesElement.querySelectorAll('a')
  links.forEach((link, i) => {
    if (!isPosLink(link)) {
      return
    }

    const url = new URL(link.href)
    const hash = url.hash
    const id = hash.replace('#', '')
    const pos = getPos(id)
    const markedCodeString = insertMarkers(app.codeString, pos, id)

    link.id = id + '-note'
    link.classList.add('note')
    app.codeElement.insertAdjacentHTML('beforeend', `<code id="${id}" class="code-marked">${markedCodeString}</code>`)
  })
}




//Utils

function isPosLink (link) {
  //TODO: check that url is just hash + number + comma + number, regex?
  return true
}
function getPos (id) {
  let pos = id.split(',').map(n => parseInt(n))
  pos = arrayToPairs(pos)
  return pos
}

function insertMarkers (html, pos, id) {
  let acc = 0
  const startMark = '€start€'
  const startTag = `<a href="#${id}-note" class="mark">`
  const startLength = startMark.length
  const endMark = '€end€'
  const endTag = '</a>'
  const endLength = endMark.length
  const length = startLength + endLength
  pos.forEach((p, i) => {
    acc = i * length
    const start = p[0] + acc
    const end = p[1] + startLength + acc
    html = html.slice(0, start) + startMark + html.slice(start);
    html = html.slice(0, end) + endMark + html.slice(end);
  })
  html = html.replaceAll('<', '&lt;')
  html = html.replaceAll('<', '&gt;')
  html = html.replaceAll(startMark, startTag)
  html = html.replaceAll(endMark, endTag)

  return html
}

function arrayToPairs (array) {
  let pairs = [];
  for(let i = 0; i < array.length; i += 2) {
    pairs.push(array.slice(i, i + 2));
  }
  return pairs;
}
function isOdd (num) {
  num = parseInt(num)
  return num % 2 == 1
}
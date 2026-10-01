import './style.css'

const target = new Date('2027-10-04T00:00:00+01:00')

const labels = {
  days: ['dia', 'dias'],
  hours: ['hora', 'horas'],
  minutes: ['minuto', 'minutos'],
}

function format(value, unit) {
  const [singular, plural] = labels[unit]
  return `${value} ${value === 1 ? singular : plural}`
}

function renderCountdown() {
  const remaining = Math.max(0, target.getTime() - Date.now())
  const totalMinutes = Math.floor(remaining / 60000)
  const days = Math.floor(totalMinutes / 1440)
  const hours = Math.floor((totalMinutes % 1440) / 60)
  const minutes = totalMinutes % 60

  document.querySelector('[data-unit="days"]').textContent = format(days, 'days')
  document.querySelector('[data-unit="hours"]').textContent = format(hours, 'hours')
  document.querySelector('[data-unit="minutes"]').textContent = format(minutes, 'minutes')
}

renderCountdown()
setInterval(renderCountdown, 1000)

const photos = document.querySelectorAll('.photos img')

// One song per photo — drop the files into public/music/ as track-1.mp3, track-2.mp3, …
const tracks = [...photos].map((_, i) => `./music/track-${i + 1}.mp3`)
const audio = document.querySelector('audio')
const playButton = document.querySelector('[data-action="toggle"]')
const playIcon = playButton.querySelector('img')
let current = 0

function setPlaying(playing) {
  playIcon.src = playing ? './icons/pause.svg' : './icons/play_arrow.svg'
  playButton.setAttribute('aria-label', playing ? 'Pausar música' : 'Tocar música')
}

function play() {
  if (!audio.src) audio.src = tracks[current]
  audio.play().catch(() => setPlaying(false))
}

// Photos load on demand so the first visit only downloads what's on screen
function load(index) {
  const photo = photos[(index + photos.length) % photos.length]
  if (photo.dataset.src) {
    photo.src = photo.dataset.src
    delete photo.dataset.src
  }
}

function show(index) {
  const wasPlaying = !audio.paused
  current = (index + photos.length) % photos.length
  load(current)
  load(current + 1)
  load(current - 1)

  photos.forEach((photo, i) => photo.classList.toggle('is-active', i === current))
  audio.src = tracks[current]
  if (wasPlaying) play()
}

audio.addEventListener('play', () => setPlaying(true))
audio.addEventListener('pause', () => setPlaying(false))
audio.addEventListener('ended', () => {
  show(current + 1)
  play()
})

document.querySelector('[data-action="prev"]').addEventListener('click', () => show(current - 1))
document.querySelector('[data-action="next"]').addEventListener('click', () => show(current + 1))
playButton.addEventListener('click', () => (audio.paused ? play() : audio.pause()))

window.addEventListener('load', () => {
  load(1)
  load(-1)
})

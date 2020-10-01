const AudioContext = window.AudioContext || window.webkitAudioContext
const audioContext = new AudioContext()
const audioAnalyser = audioContext.createAnalyser()

const audioElement = document.getElementById('inputAudio')
const track = audioContext.createMediaElementSource(audioElement)
track.connect(audioAnalyser)
audioAnalyser.connect(audioContext.destination)

let isAudioPlaying = false
document.getElementById('playButton').addEventListener('click', function() {
    if (audioContext.state == 'suspended') {
        audioContext.resume()
    }

    if (isAudioPlaying) {
        audioElement.pause()
    } else {
        audioElement.play()
    }
    isAudioPlaying = !isAudioPlaying
})

let bufferLength = audioAnalyser.frequencyBinCount
let dataArray = new Uint8Array(bufferLength)
const WIDTH = 1200, HEIGHT = 500
const canvas = document.getElementById('canvas')
canvas.width = WIDTH
canvas.height = HEIGHT
const ctx = canvas.getContext('2d')
ctx.clearRect(0, 0, WIDTH, HEIGHT);

function draw() {
    requestAnimationFrame(draw)

    ctx.fillStyle = 'rgb(200, 200, 200)';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    audioAnalyser.getByteTimeDomainData(dataArray)

    ctx.fillStyle = 'rgb(0, 100, 100)';
    ctx.beginPath();

    let x = 0
    let xWidth = WIDTH / bufferLength
    for (let i = 0; i < bufferLength; i++) {
        let value = dataArray[i] * (HEIGHT / 128.0)

        ctx.fillRect(x, HEIGHT - (value / 2), xWidth, value)
        x += xWidth
    }
}

draw()
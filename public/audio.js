function hasGetUserMedia() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
}

// const WIDTH = 1200, HEIGHT = 200
// const canvas = document.getElementById('canvas')
// canvas.width = WIDTH
// canvas.height = HEIGHT
// const ctx = canvas.getContext('2d')
// ctx.clearRect(0, 0, WIDTH, HEIGHT);

class Audio {
    constructor() {
        const AudioContext = window.AudioContext || window.webkitAudioContext
        this.audioContext = new AudioContext()
        this.audioAnalyser = this.audioContext.createAnalyser()
        this.audioAnalyser.smoothingTimeConstant = 1
        
        // !! YOU CAN SET YOUR FFT SIZE VALUE LIKE THIS !!
        // this.audioAnalyser.fftSize = 256

        document.getElementById('inputAudio').addEventListener('change', (event) => {
            const audioElement = document.getElementById('testAudio')
            audioElement.src = URL.createObjectURL(event.currentTarget.files[0])
            // this.connectAudioSource(audioElement)
        })
        
        this.connectAudioSource(document.getElementById('testAudio'))
        // this.connectMicrophoneSource()

        // Allocate dataArray which will contain FFT data of audio
        this.bufferLength = this.audioAnalyser.frequencyBinCount
        this.dataArray = new Uint8Array(this.bufferLength)

        this.fractalAnalysis = new AudioFractalAnalysis()
    }

    connectMicrophoneSource = () => {
        if (hasGetUserMedia()) {
            navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
                console.log(stream)
                const mediaStreamSource = this.audioContext.createMediaStreamSource(stream);
                mediaStreamSource.connect(this.audioContext.destination)
                mediaStreamSource.connect(this.audioAnalyser)
                console.log('Microphone connected')
            })
        } else {
            console.log('Could not find getUserMedia')
        }
    }

    connectAudioSource = (audioElement) => {
        const track = this.audioContext.createMediaElementSource(audioElement)
        track.connect(this.audioAnalyser)
        this.audioAnalyser.connect(this.audioContext.destination)

        this.isAudioPlaying = false
        document.getElementById('playButton').addEventListener('click', () => {
            if (this.audioContext.state == 'suspended') {
                this.audioContext.resume()
            }

            if (this.isAudioPlaying) {
                audioElement.pause()
            } else {
                audioElement.play()
            }
            this.isAudioPlaying = !this.isAudioPlaying
        })
    }

    update = () => {
        this.audioAnalyser.getByteTimeDomainData(this.dataArray)
        this.fractalAnalysis.updateFft(this.dataArray, this.bufferLength)

        // // FFT visualization to help developing
        // ctx.fillStyle = 'rgb(200, 200, 200)';
        // ctx.fillRect(0, 0, WIDTH, HEIGHT);
        // this.audioAnalyser.getByteTimeDomainData(this.dataArray)

        // ctx.fillStyle = 'rgb(0, 100, 100)';
        // ctx.beginPath();

        // let x = 0
        // let xWidth = WIDTH / this.bufferLength
        // for (let i = 0; i < this.bufferLength; i++) {
        //     let value = this.dataArray[i] * (HEIGHT / 128.0)

        //     ctx.fillRect(x, HEIGHT - (value / 2), xWidth, value)
        //     x += xWidth
        // }
    }

    getFractalSeedInfo = () => {
        return this.fractalAnalysis.getWeights()
    }
}

class AudioFractalAnalysis {
    // Called every frame with fftArray containing FFT data for binCount number of bins
    updateFft(fftArray, binCount) {

    }

    // Called when we are ready to make the call to generate fractal; returns array of weights
    getWeights() {
        return [0.2, 0.3, 0.5, 0.4]
    }
}
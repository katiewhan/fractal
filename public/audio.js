function hasGetUserMedia() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
}

class Audio {
    constructor(loadFractal, useMic) {
        const AudioContext = window.AudioContext || window.webkitAudioContext
        this.audioContext = new AudioContext()
        this.audioAnalyser = this.audioContext.createAnalyser()
        this.audioAnalyser.smoothingTimeConstant = 0.8 // should be not 1 to get FFT right
        
        // !! YOU CAN SET YOUR FFT SIZE VALUE LIKE THIS !!
        // must be a power of 2
        this.audioAnalyser.fftSize = 4096
        console.log(`FFT size: ${this.audioAnalyser.fftSize}`)
        console.log(`Min decibel level: ${this.audioAnalyser.minDecibels}`)
        console.log(`Min decibel level: ${this.audioAnalyser.maxDecibels}`)

        const audioElement = document.getElementById('audioElement')
        if (useMic) {
            this.connectMicrophoneSource()
        } else {
            this.connectAudioSource(audioElement)
        }
        loadFractal()

        // Allocate dataArray which will contain FFT data of audio
        this.bufferLength = this.audioAnalyser.frequencyBinCount
        this.fDataArray = new Uint8Array(this.bufferLength)
        this.tDataArray = new Uint8Array(this.bufferLength)

        this.fractalAnalysis = new AudioFractalAnalysis(this.audioContext.sampleRate)
    }

    connectMicrophoneSource = () => {
        if (hasGetUserMedia()) {
            navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
                console.log(stream)
                const mediaStreamSource = this.audioContext.createMediaStreamSource(stream);
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

        this.audioContext.resume()
        audioElement.play()

        // this.isAudioPlaying = false
        // document.getElementById('playButton').addEventListener('click', () => {
        //     if (this.audioContext.state == 'suspended') {
        //         this.audioContext.resume()
        //     }

        //     if (this.isAudioPlaying) {
        //         audioElement.pause()
        //     } else {
        //         audioElement.play()
        //     }
        //     this.isAudioPlaying = !this.isAudioPlaying
        // })
    }

    update = () => {
        this.audioAnalyser.getByteTimeDomainData(this.tDataArray)
        this.audioAnalyser.getByteFrequencyData(this.fDataArray)
        this.fractalAnalysis.updateFft(this.fDataArray)
    }

    setUpDebugViz = () => {
        this.WIDTH = 1200, this.HEIGHT = 200
        const canvas = document.getElementById('canvas')
        canvas.width = WIDTH
        canvas.height = HEIGHT
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
    }

    updateDebugViz = () => {
        // FFT visualization to help developing
        ctx.fillStyle = 'rgb(200, 200, 200)';
        ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);

        ctx.fillStyle = 'rgb(0, 100, 100)';
        ctx.beginPath();

        let x = 0
        let xWidth = this.WIDTH / this.bufferLength
        for (let i = 0; i < this.bufferLength; i++) {
            let value = this.tDataArray[i] * (this.HEIGHT / 128.0)

            ctx.fillRect(x, this.HEIGHT - (value / 2), xWidth, value)
            x += xWidth
        }
    }

    getFractalSeedInfo = (numParam) => {
        return this.fractalAnalysis.getParameters(numParam)
    }
}

class AudioFractalAnalysis {
    constructor(sampleRate) {
        // F5 E5 D5 C5 Bb4 A4 G4 F4 E4 D4 C4 Bb3 A3 G3 F3 E3 D3 C3 Bb2 A2 G2 F2 C2 D2 Bb1
        // special frequencies to potentially listen to
        this.freq = [
            698.46, 659.26, 287.33, 523.25, 466.16, 440, 392, 349.23, 329.64,
            293.67, 261.63, 233.08, 220, 196, 174.61, 164.81, 146.83, 130.81,
            116.54, 110, 97.999, 87.307, 65.406, 73.416, 58.27
        ]
        this.max_frequencies = []
        // Resolution in frequency domain is sample rate divided by (time domain)
        // data length (time domain data length = twice fft length)
        this.sampleRate = sampleRate
    }

    // Called every frame with fftArray containing FFT data
    updateFft(fftArray) {
        // get max absolute value, save frequency index
        let max_val = 0
        let max_index = 0
        for (let i = 0; i < fftArray.length; i++) {
            if (max_val < Math.abs(fftArray[i])) {
                max_val = Math.abs(fftArray[i])
                max_index = i
            }
        }
        this.max_frequencies.push( {index: max_index, value: max_val} )
//        console.log(`Data length: ${fftArray.length}`)
//        console.log(`Frequency resolution: ${res}`)
//        console.log(`Second val: ${fftArray[1]}`)
//        console.log(`Max frequency index: ${max_index}`)
    }

    // Called when we are ready to make the call to generate fractal;
    // returns dictionary of parameters
    getParameters(numParam) {
        // Sort by decreasing frequency
        this.max_frequencies.sort(function(a, b) {
            return b.index - a.index;
        })
        // Take five equally spaced frequencies
        // How often do these frequencies that we have chosen show up in max_frequencies?
        // What is the sum of their strengths/values?
        let w_values = []
        let m_values = []
        const spacing = Math.floor(this.max_frequencies.length / numParam)
        for (let i = 0; i < numParam; i++) {
            let count = 0
            let sum = 0
            let freq_index = this.max_frequencies[i*spacing].index
            for (let j = 0; j < this.max_frequencies.length; j++) {
                if (freq_index == this.max_frequencies[j].index) {
                    count++
                    sum += this.max_frequencies[j].value
                }
                if (freq_index > this.max_frequencies[j].index) {
                    // max_frequencies has been sorted by decreasing index
                    break
                } 
            }
            // Weights: how often the frequency shows up
            // Movements: average strength of the frequency
            w_values.push(count)
            m_values.push(Math.floor(sum/count))
        }
        //console.log(this.max_frequencies)
        console.log(w_values)
        console.log(m_values)
        return {weights: w_values, moves: m_values}
    }
}

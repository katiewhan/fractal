import { readFileSync } from 'fs'

import Fractals from './fractals'

function hasGetUserMedia() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
}

function getFractalInstrument(fractal: string) {
    switch (fractal) {
        case 'broccoli': return Fractals.InstrumentType.Euphonium
        case 'canyon': return Fractals.InstrumentType.Tuba
        case 'daisy': return Fractals.InstrumentType.Bassoon
        case 'dna': return Fractals.InstrumentType.PitchedPercussion
        case 'feathers': return Fractals.InstrumentType.Trumpet
        case 'florida': return Fractals.InstrumentType.Trombone
        case 'leaves': return Fractals.InstrumentType.Oboe
        case 'lightening': return Fractals.InstrumentType.Piano
        case 'nautilus': return Fractals.InstrumentType.Horn
        case 'pineapple': return Fractals.InstrumentType.NonPitchedPercussion
        case 'snowflake': return Fractals.InstrumentType.Flute
        case 'tree': return Fractals.InstrumentType.Clarinet
        case 'turtle': return Fractals.InstrumentType.Saxes
        default: return Fractals.InstrumentType.Flute
    }
}

function argMax(array: number[]) {
    if (array.length === 0) {
        return -1;
    }
    var max = array[0];
    var maxIndex = 0;
    for (var i = 1; i < array.length; i++) {
        if (array[i] > max) {
            maxIndex = i;
            max = array[i];
        }
    }
    return maxIndex;
//    return array.map((x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1];
}

declare global {
    interface Window {
      webkitAudioContext: typeof AudioContext
    }
}

class DimensionAudio {
    public bufferLength: number
    public fDataArray: Uint8Array
    public tDataArray: Float32Array

    private audioContext: AudioContext
    private audioAnalyser: AnalyserNode
    private fractalAnalysis: AudioFractalAnalysis

    private smoothedVolume: number = 0
    private volumeDelta: number = 0
    private minOnsetThreshold: number = 0.1
    private onsetThreshold: number = this.minOnsetThreshold
    private initialOnsetDetected: boolean = false
    private onsetDetected: boolean = false

    constructor(private generateFractal: (type: Fractals.InstrumentType, seed: DimensionAudio.SeedParameters) => void, useMic: boolean = true) {
        const AudioContext = window.AudioContext || window.webkitAudioContext
        this.audioContext = new AudioContext()
        this.audioAnalyser = this.audioContext.createAnalyser()

        // Some parameters to tweak:
        // fftSize: number of samples of time data for windowed FFT (integer power of 2)
        // smoothingTimeConstant: Smoothing; anything in (0,1) (NOT equal to 1)
        // minDecibels/maxDecibels: Might need to mess with?
        this.audioAnalyser.fftSize = 4096
        this.audioAnalyser.smoothingTimeConstant = 0.8
        this.audioAnalyser.minDecibels = -100
        this.audioAnalyser.maxDecibels = -20
        console.log(`FFT size: ${this.audioAnalyser.fftSize}`)
        console.log(`Num freq bins: ${this.audioAnalyser.frequencyBinCount}`)
        console.log(`Sample rate: ${this.audioContext.sampleRate}`)
        console.log(`Smoothing: ${this.audioAnalyser.smoothingTimeConstant}`)
        console.log(`Min decibel level: ${this.audioAnalyser.minDecibels}`)
        console.log(`Max decibel level: ${this.audioAnalyser.maxDecibels}`)

        if (useMic) {
            this.connectMicrophoneSource()
        } else {
            // const audioElement = document.getElementById('audioElement')
            // this.connectAudioSource(audioElement)
        }

        // Allocate dataArray which will contain FFT data of audio
        this.bufferLength = this.audioAnalyser.frequencyBinCount
        this.fDataArray = new Uint8Array(this.bufferLength)
        this.tDataArray = new Float32Array(this.bufferLength)

        this.fractalAnalysis = new AudioFractalAnalysis(this.audioContext.sampleRate,
                                                        this.audioAnalyser.frequencyBinCount)
    }

    private connectMicrophoneSource() {
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

    private connectAudioSource(audioElement: HTMLMediaElement) {
        const track = this.audioContext.createMediaElementSource(audioElement)
        track.connect(this.audioAnalyser)
        this.audioAnalyser.connect(this.audioContext.destination)

        this.audioContext.resume()
        audioElement.play()
    }

    public update() {
        // Update both time and frequency domain data
        // and in particular run the fractalAnalysis update
        this.audioAnalyser.getFloatTimeDomainData(this.tDataArray)
        this.audioAnalyser.getByteFrequencyData(this.fDataArray)

        if (this.initialOnsetDetected) {
            this.fractalAnalysis.updateFft(this.fDataArray)
        }

        // Calculate volume with smoothing
        let volume = 0
        for (let i = 0; i < this.bufferLength; i++) {
            volume += this.tDataArray[i] * this.tDataArray[i]
        }
        volume /= this.bufferLength
        volume = Math.sqrt(volume)

        const prevVolume = this.smoothedVolume
        this.smoothedVolume = this.smoothedVolume * 0.96 + volume * 0.04
        this.volumeDelta = (prevVolume - this.smoothedVolume)

        // Detect onset
        this.onsetThreshold = this.onsetThreshold * 0.05 + this.minOnsetThreshold * 0.95
        if (volume > this.onsetThreshold) {
            if (!this.initialOnsetDetected) {
                this.initialOnsetDetected = true
                console.log('Initial onset detected')
                this.triggerFractalGeneration()
            }
            this.onsetDetected = true
        } else {
            this.onsetDetected = false
        }
        this.onsetThreshold = volume
    }

    public getVolume() {
        return this.smoothedVolume
    }

    public getVolumeDelta() {
        return this.volumeDelta
    }

    public getOnsetDetected() {
        return this.onsetDetected
    }

    public getInitialOnsetDetected() {
        return this.initialOnsetDetected
    }

    private triggerFractalGeneration() {
        // Wait 30 seconds from first detection of sound to show fractal visuals
        setTimeout(() => {
            // THIS IS WHERE WE PASS THE FINGERPRINT RESULT
            this.generateFractal(this.fractalAnalysis.getClassPredictions(), this.fractalAnalysis.getParameters(5))
        }, 30000)
    }
}

class AudioFractalAnalysis {
    private classes: string[]
    private maxFrequencies: DimensionAudio.MaxFrequency[]
    private bandIndices: number[]
    private bandMaxes: number[]
    private features: number[]
    private classScores: number[]
    private fingerprints: number[][]
    private featureCount: number
    private skipFrames: number
    private skipCount: number
    private doAnalyzer: boolean
    private doClassifier: boolean
    private testing: boolean

    constructor(sampleRate: number, frequencyBinCount: number) {
        // Resolution in frequency domain is sample rate divided by (time domain)
        // data length (time domain data length = twice fft length)
        //this.sampleRate = sampleRate
        this.classes = [
        'broccoli', 'canyon', 'daisy', 'dna', 'feathers', 'florida', 'leaves',
        'lightening', 'nautilus', 'pineapple', 'snowflake', 'tree', 'turtle'
        ]
        // Keep track of the max frequencies at each step;
        // features will be max frequencies in various bands,
        // the indices of which in the FFT data are given by bandIndices
        // allocate for features (assuming 5 seconds @ 24 FPS)
        // as well as ultimate scores
        this.maxFrequencies = []
        this.bandIndices = [10, 20, 40, 80, 159, 508]
        this.bandMaxes = new Array(this.bandIndices.length).fill(0)
        this.features = new Array(this.bandIndices.length*5*24).fill(0)
        this.classScores = new Array(this.classes.length).fill(0)
        this.fingerprints = this.getFingerprints(2 * frequencyBinCount)
        this.featureCount = 0
        this.skipFrames = 24
        this.skipCount = 0
        this.doAnalyzer = true
        this.doClassifier = true
        this.testing = true
        // check that sizing makes sense
        if (this.classes.length != this.fingerprints.length) {
            console.log(`Classes length: ${this.classes.length}`)
            console.log(`Fingerprints length: ${this.fingerprints.length}`)
        }
    }

    // Read fingerprints from CSVs
    private getFingerprints(fftSize: number) {
        let f_all = readFileSync(__dirname + '/static/fingerprints_4096.csv', 'utf8')
        if (fftSize != 4096) {
            console.log(`Expected FFT size 4096; got ${fftSize}`)
        }
        // remove whitespace and file terminators
        f_all = f_all.trim();
        let f_lines = f_all.split('\n')
        let m = f_lines.length
        let fingerprints = []
        for (let i = 0; i < m; i++) {
            let tokens = f_lines[i].split(',')
            fingerprints[i] = new Array(tokens.length)
            for (let j = 0; j < tokens.length; ++j) {
                fingerprints[i][j] = parseFloat(tokens[j])
            }
        }
        return fingerprints
    }

    // Called every frame with fftArray containing FFT data
    public updateFft(fftArray: Uint8Array) {
        if (this.doAnalyzer || this.doClassifier) {
            let max_indval = this.getMaxFrequencies(this.bandMaxes, fftArray)
            this.maxFrequencies.push( {index: max_indval[0], value: max_indval[1]} )
        }
        if (this.doClassifier) {
            // Skip some initial frames - helps robustness?
            if (this.skipCount < this.skipFrames) {
                this.skipCount++
                return
            }
            // Copy this.bandMaxes - the frequency maxima in various bands -
            // into features
            for (let i = 0; i < this.bandMaxes.length; i++) {
                this.features[this.featureCount] = this.bandMaxes[i]
                this.featureCount++
            }
            if (this.featureCount >= this.features.length) {
                this.doClassifier = false
                this.calculateScores()
            }
        }
        return
    }

    // Analyze the frequencies to get max frequency (index) in various bands
    private getMaxFrequencies(band_maxes: number[], fftArray: Uint8Array) {
        let band_number = 0
        let max_ind = 0
        let max_val = -1
        let overall_max_ind = 0
        let overall_max_val = -1
        for (let i = 0; i < fftArray.length; i++) {
            // As we go through elements of fftArray,
            // keep track of max and reset as we pass through the bands
            if (i >= this.bandIndices[band_number]) {
                band_maxes[band_number] = max_ind
                max_val = -1
                band_number++
            }
            if (band_number >= this.bandIndices.length) { break }
            // fftArray elements are nonnegative, no need for abs
            if (max_val < fftArray[i]) {
                max_val = fftArray[i]
                max_ind = i
                // Overall max only needs to be updated when band max is
                if (overall_max_val < fftArray[i]) {
                    overall_max_val = fftArray[i]
                    overall_max_ind = i
                }
            }
        }
        return [overall_max_ind, overall_max_val]
    }

    private calculateScores() {
        // Features represent ~ 4 to 5 seconds of sound
        // Essentially, convolve this with loaded fingerprints in some way.
        // We will view features/fingerprints as a sparse representation of
        //   one-hot encoding of the band maxima.
        // So the score will be the number of times the band maxima line up/agree
        // This yields a sequence of windowed score values for each class,
        // and take max value over windows as final class score
        let max_score = 0
        let score = 0
        let step_length = this.bandIndices.length
        let stop_index = this.fingerprints[0].length - this.features.length
        // Iterate over fingerprints/classes
        for (let k = 0; k < this.fingerprints.length; k++) {
            // Iterate over shifts in fingerprint (convolve with features)
            max_score = -1 
            for (let j = 0; j < stop_index; j += step_length) {
                // Iterate over elements in features and
                // compute score for this window
                score = 0
                for (let i = 0; i < this.features.length; i++) {
                    if (this.features[i] == this.fingerprints[k][j+i]) {
                        score++
                    }
                }
                if (score > max_score) {
                    max_score = score
                }
            } // end j loop (convolution)
            this.classScores[k] = max_score
        } // end k loop (all fingerprints/classes)

        // For testing
        if (this.testing) {
            // Display predictions and download features
            this.getClassPredictions()
            let blob = new Blob([this.features.join(',')], { type: 'text/csv' })
            let a = window.document.createElement("a")
            a.href = window.URL.createObjectURL(blob)
            a.download = "features.csv"
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            // Max byte val:
            this.maxFrequencies.sort(function(a, b) { return b.value - a.value; })
            console.log(`Max byte val: ${this.maxFrequencies[0].value}`)
        }
    }

    // Call sometime in the first couple seconds to get predicted fractal class
    public getClassPredictions() {
        // Predicted class is majority vote over predictions from
        // each individual frame
        let class_index = argMax(this.classScores)
        let class_pred = this.classes[class_index]
        let instrument_pred = getFractalInstrument(class_pred)
        this.doClassifier = false
        console.log(`Final win tally: ${this.classScores}`)
        console.log(`Predicted class: ${class_pred}`)
        console.log(`Feature length: ${this.featureCount}`)
        return instrument_pred
    }

    // Called when we are ready to make the call to generate fractal;
    // returns dictionary of parameters
    public getParameters(numParam: number) {
        // Sort by decreasing frequency
        this.maxFrequencies.sort(function(a, b) {
            return b.index - a.index;
            //return b.value - a.value;
        })
        // Go thru sorted frequencies;
        // count the top N unique frequencies and sum their strengths/values
        let w_values = []
        let m_values = []
        let curr_val  = this.maxFrequencies[0].value
        let curr_freq = this.maxFrequencies[0].index
        let count = 1
        let sum = curr_val
        let the_freq = curr_freq
        for (let j = 1; j < this.maxFrequencies.length; j++) {
            curr_val  = this.maxFrequencies[j].value
            curr_freq = this.maxFrequencies[j].index
            if (curr_freq == the_freq) {
                count += 1
                sum += curr_val
            } else {
                // Weights: how often the frequency shows up
                // Movements: average strength of the frequency
                w_values.push(count)
                m_values.push(Math.floor(sum/count))
                // Reset count/sum/frequency
                count = 1
                sum = curr_val
                the_freq = curr_freq
            }
            // Stop if we have counted enough unique frequencies
            if (w_values.length >= numParam) {
                break
            }
        }
        // no need to do frequency analysis anymore
        this.doAnalyzer = false
        console.log(`Weights: ${w_values}`)
        console.log(`Moves: ${m_values}`)
        return {weights: w_values, moves: m_values}
    }
}

namespace DimensionAudio {
    export interface MaxFrequency {
        index: number
        value: number
    }

    export interface SeedParameters {
        weights: number[]
        moves: number[]
    }
}

export default DimensionAudio

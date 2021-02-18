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
        default: return -1
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
    private minOnsetThreshold: number = 0.1
    private onsetThreshold: number = this.minOnsetThreshold
    private onsetDetected: boolean = false

    constructor(private generateFractal: (type: Fractals.InstrumentType, seed: DimensionAudio.SeedParameters) => void, useMic: boolean = true) {
        const AudioContext = window.AudioContext || window.webkitAudioContext
        this.audioContext = new AudioContext()
        this.audioAnalyser = this.audioContext.createAnalyser()

        // Some parameters to tweak:
        // fftSize: number of samples of time data for windowed FFT (integer power of 2)
        // smoothingTimeConstant: Smoothing; anything in (0,1) (NOT equal to 1)
        // minDecibels/maxDecibels: Might need to mess with?
        this.audioAnalyser.fftSize = 2048
        this.audioAnalyser.smoothingTimeConstant = 0.0
//        this.audioAnalyser.minDecibels = -90
        this.audioAnalyser.maxDecibels = -10
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

        if (this.onsetDetected) {
            this.fractalAnalysis.updateFft(this.fDataArray)
        }

        // Calculate volume with smoothing
        let volume = 0
        for (let i = 0; i < this.bufferLength; i++) {
            volume += this.tDataArray[i] * this.tDataArray[i]
        }
        volume /= this.bufferLength
        volume = Math.sqrt(volume)

        this.smoothedVolume = this.smoothedVolume * 0.92 + volume * 0.08

        // Detect beginning onset
        if (!this.onsetDetected) {
            this.onsetThreshold = this.onsetThreshold * 0.05 + this.minOnsetThreshold * 0.95
            if (volume > this.onsetThreshold) {
                this.onsetDetected = true
                console.log('Onset detected')
                this.triggerFractalGeneration()
            }
            this.onsetThreshold = volume
        }
    }

    public getVolume() {
        return this.smoothedVolume
    }

    public getOnsetDetected() {
        return this.onsetDetected
    }

    private triggerFractalGeneration() {
        // Wait 45 seconds from first detection of sound to show fractal visuals
        setTimeout(() => {
            // THIS IS WHERE WE PASS THE FINGERPRINT RESULT
            console.log(this.fractalAnalysis.getClassPredictions())
            this.generateFractal(Fractals.InstrumentType.Clarinet, this.fractalAnalysis.getParameters(5))
        }, 45000)
    }
}

class AudioFractalAnalysis {
    //private freq: number[]
    //private sampleRate: number
    private classes: string[]
    private maxFrequencies: DimensionAudio.MaxFrequency[]
    private features: number[][]
    private class_wins: number[]
    private classifier_weights: number[][]
    private classifier_intrcpts: number[]
    private numFrames: number
    private frameCount: number
    private doAnalyzer: boolean
    private doClassifier: boolean

    constructor(sampleRate: number, frequencyBinCount: number) {
        // Resolution in frequency domain is sample rate divided by (time domain)
        // data length (time domain data length = twice fft length)
        //this.sampleRate = sampleRate
        // F5 E5 D5 C5 Bb4 A4 G4 F4 E4 D4 C4 Bb3 A3 G3 F3 E3 D3 C3 Bb2 A2 G2 F2 C2 D2 Bb1
        // special frequencies to potentially listen to
        //this.freq = [
        //    698.46, 659.26, 287.33, 523.25, 466.16, 440, 392, 349.23, 329.64,
        //    293.67, 261.63, 233.08, 220, 196, 174.61, 164.81, 146.83, 130.81,
        //    116.54, 110, 97.999, 87.307, 65.406, 73.416, 58.27
        //]
        this.classes = [
        'broccoli', 'canyon', 'daisy', 'dna', 'feathers', 'florida', 'leaves',
        'lightening', 'nautilus', 'nothing', 'pineapple', 'snowflake', 'tree', 'turtle'
        ]
        // Keep track of the max frequencies at each step;
        // also accumulate class scores for classifier
        this.maxFrequencies = []
        this.features = []
        this.class_wins = new Array(this.classes.length).fill(0)
        let params = this.get_classifier_parameters()
        this.classifier_weights = params[0]
        this.classifier_intrcpts = params[1]
        this.numFrames = this.classifier_weights[0].length / frequencyBinCount
        this.frameCount = 0
        this.doAnalyzer = true
        this.doClassifier = true
        // check that sizing makes sense
        if (this.classes.length != this.classifier_intrcpts.length ||
            this.classes.length != this.classifier_weights.length) {
            console.log(`Classes length: ${this.classes.length}`)
            console.log(`Intercepts length: ${this.classifier_intrcpts.length}`)
            console.log(`Weights length: ${this.classifier_weights.length}`)
        }
        console.log(`Num frames: ${this.numFrames}`)
    }

    // Read classifier parameters from CSVs
    public get_classifier_parameters() {
        let w_all = readFileSync(__dirname + '/static/weights.csv', 'utf8')
        let b_all = readFileSync(__dirname + '/static/intercepts.csv', 'utf8')
        // remove whitespace and file terminators
        w_all = w_all.trim();
        b_all = b_all.trim();
        let w_lines = w_all.split('\n')
        let b_lines = b_all.split('\n')
        let m = w_lines.length
        let weights = []
        let intercepts = new Array(m)
        for (let i = 0; i < m; i++) {
            let tokens = w_lines[i].split(',')
            weights[i] = new Array(tokens.length)
            intercepts[i] = parseFloat(b_lines[i])
            for (let j = 0; j < tokens.length; ++j) {
                weights[i][j] = parseFloat(tokens[j])
            }
        }
        return [weights, intercepts]
    }

    // Called every frame with fftArray containing FFT data
    public updateFft(fftArray: Uint8Array) {
        if (this.doAnalyzer) {
            // get max absolute value, save frequency index
            let max_val = 0
            let max_index = 0
            for (let i = 0; i < fftArray.length; i++) {
                if (max_val < Math.abs(fftArray[i])) {
                    max_val = Math.abs(fftArray[i])
                    max_index = i
                }
            }
            this.maxFrequencies.push( {index: max_index, value: max_val} )
            //console.log(`Max byte val: ${max_val}`)
        }
        if (this.doClassifier) {
            // Use frequency data for classification of fractal/instrument
            this.updateClassifications(fftArray)
            this.frameCount++
            // Classifier won't be very robust if it runs longer than intended
            if (this.frameCount > this.numFrames+10) {
                this.doClassifier = false
                // For testing:
                //this.getClassPredictions()
            }
        }
    }

    // Record features; update classification guesses
    public updateClassifications(fftArray: Uint8Array) {
        // update array of features - push copy of FFT data
        // remove earliest data if needed
        this.features.push([...fftArray])
        if (this.features.length > this.numFrames) {
            this.features.shift()
        } else {
            // array of features not long enough to apply classifier yet
            // (this might skip one useable frame, but whatever)
            return
        }
        // Accumulate class scores and record the max
        // FFT data is passed as "Bytes" - so an integer between 0 and 255
        // Scale by 255 to get a float in [0,1]
        let max_index = 0
        let max_score = 0
        for (let i = 0; i < this.classes.length; i++) {
            let class_score = this.classifier_intrcpts[i]
            let tmp = 0
            let offset = 0
            for (let j = 0; j < this.numFrames; j++) {
                for (let k = 0; k < fftArray.length; k++) {
                    tmp = this.features[j][k] * this.classifier_weights[i][offset+k]
                    class_score += (tmp / 255)
                }
                offset += fftArray.length
            }
            // Update the max class score (will only update if positive)
            if (class_score > max_score) {
                max_score = class_score
                max_index = i
            }
        }
        // Record which class is predicted for this chunk of frames
        // (but only if its a strong - i.e. positive - prediction)
        if (max_score > 0) {
            this.class_wins[max_index] += 1
        }
    }

    // Call sometime in the first couple seconds to get predicted fractal class
    public getClassPredictions() {
        // Predicted class is majority vote over predictions from
        // each individual frame
        let class_index = argMax(this.class_wins)
        let class_pred = this.classes[class_index]
        this.doClassifier = false
        console.log(`Final win tally: ${this.class_wins}`)
        console.log(`Predicted class: ${class_pred}`)
        console.log(`Number of frames used: ${this.frameCount}`)
        return getFractalInstrument(class_pred)
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

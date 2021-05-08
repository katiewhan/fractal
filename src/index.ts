import P5 from 'p5'
import { readFileSync } from 'fs'

import DimensionAudio from './audio'
import Fractals from './fractals'
import LSystem from './lsystem'
import Particle from './particle'

enum SketchState {
    None,
    Listening,
    Particles,
    LargeFractal,
    Fractal,
    Shader
}

class App {
    private p5: P5
    private particles: Particle[]
    private backgroundParticles: Particle[]

    private audio?: DimensionAudio
    private generator?: LSystem
    private fractalImage?: P5.Image
    private backgroundShader?: P5.Shader
    private backgroundColors?: Fractals.Color[]
    private foregroundColor?: Fractals.Color

    private state: SketchState = SketchState.None
    private fractalProgress: number = 0
    private fractalAlpha: number = 1
    private useBackgroundAlpha: boolean = false

    private sizeProgress: number = 1

    constructor(p5: P5) {
        this.p5 = p5
        this.particles = []
        this.backgroundParticles = []

        this.p5.setup = () => {
            this.p5.createCanvas(window.innerWidth, window.innerHeight, this.p5.WEBGL)
            this.p5.imageMode(this.p5.CENTER)
            this.p5.rectMode(this.p5.CENTER)
            this.p5.noStroke()

            this.p5.frameRate(24)

            // Disable depth test to render elements in order of draw
            const canvas = document.getElementById('defaultCanvas0') as HTMLCanvasElement
            const gl = canvas?.getContext('webgl')
            if (gl) {
                gl.disable(gl.DEPTH_TEST)
                gl.enable(gl.BLEND)
            }

            // Set up shader
            const vert = readFileSync(__dirname + '/static/shader.vert', 'utf8')
            const frag = readFileSync(__dirname + '/static/shader.frag', 'utf8')
            this.backgroundShader = this.p5.createShader(vert, frag)
        }
    
        this.p5.draw = () => {
            this.p5.background(0)
            if (this.audio) this.audio.update()

            switch (this.state) {
                case SketchState.Listening:
                    if (this.audio && this.audio.getInitialOnsetDetected()) this.drawDots()
                    break
                case SketchState.Particles:
                    if (this.backgroundShader && this.backgroundColors && this.audio) this.drawBackground(this.backgroundShader, this.backgroundColors, this.audio)
                    if (this.audio && this.fractalImage) this.drawParticles(this.audio, this.fractalImage)
                    break
                case SketchState.LargeFractal:
                    if (this.fractalImage && this.generator) this.drawLargeFractal(this.fractalImage, this.generator)
                    break
                case SketchState.Fractal:
                    if (this.backgroundShader && this.backgroundColors && this.audio) this.drawBackground(this.backgroundShader, this.backgroundColors, this.audio)
                    if (this.audio && this.fractalImage && this.generator && this.foregroundColor) this.drawFractals(this.audio, this.fractalImage, this.generator, this.foregroundColor)
                    break
                case SketchState.Shader:
                    if (this.backgroundShader && this.backgroundColors && this.audio) this.drawBackground(this.backgroundShader, this.backgroundColors, this.audio)
                    break
                case SketchState.None:
                    break
            }
        }
    
        this.p5.windowResized = () => { 
            this.p5.resizeCanvas(window.innerWidth, window.innerHeight)
        }
    }

    public start() {
        // this.createParticles(this.backgroundParticles, undefined, 3, 3)
        // this.state = SketchState.Fractal
        // const fractalPreset = Fractals.fractalPresets[Fractals.InstrumentType.Tuba]
        // this.fractalImage = this.p5.loadImage('https://i.imgur.com/W3q4bOu.png')
        // this.generator = new LSystem(fractalPreset.lSystem)
        // this.backgroundColors = fractalPreset.backgroundColors
        // this.foregroundColor = fractalPreset.foregroundColor

        this.state = SketchState.Listening

        this.audio = new DimensionAudio((type: Fractals.InstrumentType, seed: DimensionAudio.SeedParameters) => {
            const fractalPreset = Fractals.fractalPresets[type]
            this.backgroundColors = fractalPreset.backgroundColors
            this.foregroundColor = fractalPreset.foregroundColor
            this.generator = new LSystem(fractalPreset.lSystem)

            // Fetch fractal image from backend
            let params = ''
            for (let i = 0; i < seed.weights.length; i++) {
                params += `w${i}=${seed.weights[i]}&`
            }
            for (let i = 0; i < seed.moves.length; i++) {
                params += `m${i}=${seed.moves[i]}&`
            }
            this.fractalImage = this.p5.loadImage(`https://pe6ulsde12.execute-api.us-east-2.amazonaws.com/default/MusicFractalBot?${params}`, () => {
                // Transition to next state
                this.state = SketchState.LargeFractal
                this.fractalProgress = 0
            })
        })
    }

    private createParticles(particlesArray: Particle[], sizeFactor: number = 50, numParticles: number = window.innerWidth / 30, speedFactor: number = 1) {
        for (let i = 0; i < numParticles; i++) {
            particlesArray.push(new Particle(this.p5, window.innerWidth, window.innerHeight, sizeFactor, speedFactor))
        }
    }

    private drawParticles(audio: DimensionAudio, fractalImage: P5.Image) {
        const preProgress = Math.min(this.fractalProgress, 51) * 5
        const alpha = this.fractalAlpha * 255

        this.p5.push()
        this.p5.tint(255, Math.min(preProgress, alpha))
        const audioValue = audio.getVolume()
        for (let particle of this.particles) {
            particle.moveParticle(audioValue)
            particle.draw(fractalImage)
        }
        this.p5.pop()

        this.fractalProgress++
        this.fractalAlpha -= (1 / 1200) // 50 seconds to reach 0
    }

    private drawDots() {
        this.p5.fill(200)

        let angle = this.p5.frameCount * 0.2
        for (let x = -1; x < 2; x++) {
            this.p5.push()
            this.p5.translate(x * 40, Math.sin(angle + x) * 10)
            this.p5.rotate(angle + x)
            this.p5.rect(0, 0, 15, 15)
            this.p5.pop()
        }
    }

    private drawBackground(shader: P5.Shader, backgroundColors: Fractals.Color[], audio: DimensionAudio) {
        for (let particle of this.backgroundParticles) {
            particle.moveParticle(0)
        }

        const xOffset = window.innerWidth
        const yOffset = window.innerHeight
        shader.setUniform('cell0', [this.backgroundParticles[0].position.x + xOffset, this.backgroundParticles[0].position.y + yOffset])
        shader.setUniform('cell1', [this.backgroundParticles[1].position.x + xOffset, this.backgroundParticles[1].position.y + yOffset])
        shader.setUniform('cell2', [this.backgroundParticles[2].position.x + xOffset, this.backgroundParticles[2].position.y + yOffset])

        shader.setUniform('colorBg', [backgroundColors[0].r / 255, backgroundColors[0].g / 255, backgroundColors[0].b / 255])
        shader.setUniform('color0', [backgroundColors[1].r / 255, backgroundColors[1].g / 255, backgroundColors[1].b / 255])
        shader.setUniform('color1', [backgroundColors[2].r / 255, backgroundColors[2].g / 255, backgroundColors[2].b / 255])
        shader.setUniform('color2', [backgroundColors[3].r / 255, backgroundColors[3].g / 255, backgroundColors[3].b / 255])

        let alpha;
        if (this.useBackgroundAlpha) {
            alpha = Math.min(audio.getVolume() * 10, 1.0)
        } else {
            alpha = Math.min(1, this.fractalProgress / 100)

            if (alpha == 1) {
                // Transition to next state
                // this.state = SketchState.Fractal
                // this.fractalProgress = 0
                // this.fractalAlpha = 1
                this.useBackgroundAlpha = true
            }
        }

        shader.setUniform('alpha', alpha)
        shader.setUniform('u_resolution', [xOffset, yOffset])

        this.p5.shader(shader)
        this.p5.rect(0, 0, xOffset, yOffset)
    }

    private drawLargeFractal(fractalImage: P5.Image, generator: LSystem) {
        const preProgress = Math.min(this.fractalProgress, 85) * 3
        const postProgress = Math.max(this.fractalProgress - 240, 0)
        const alpha = Math.max(255 - postProgress, 0)

        this.p5.push()
        this.p5.tint(255, Math.min(preProgress, alpha))

        if (alpha == 0) {
            this.p5.pop()

            // Transition to next state
            this.state = SketchState.Fractal
            this.fractalProgress = 0
            this.useBackgroundAlpha = true

            // Create particles for background color and for particle effect
            this.createParticles(this.backgroundParticles, undefined, 3, 3)
            // this.createParticles(this.particles, generator.size)
        } else {
            let size = Math.min(window.innerWidth, window.innerHeight)
            size += (postProgress * postProgress) / 8
            this.p5.image(fractalImage, 0, 0, size, size)
            this.p5.pop()
            this.fractalProgress++
        }
    }

    private drawFractals(audio: DimensionAudio, fractalImage: P5.Image, generator: LSystem, foregroundColor: Fractals.Color) {
        const audioValue = audio.getVolume() * 10
        const noiseFunc = this.audioNoise(audioValue)

        const preProgress = Math.abs(Math.sin(this.fractalProgress * 0.0005))

        const sign = Math.round(Math.max(Math.min(audio.getVolumeDelta() * 1000, 1), -1))
        this.sizeProgress = this.sizeProgress * 0.93 + (this.sizeProgress + sign) * 0.07
        let fractalSize = generator.size + this.sizeProgress

        this.p5.tint(foregroundColor.r, foregroundColor.g, foregroundColor.b, 255)

        generator.generate((x, y, a, i) => {
            this.p5.push()
            this.p5.translate(x, y)
            this.p5.rotate(noiseFunc(i, 0, a))
            this.p5.image(fractalImage, 0, 0, fractalSize + noiseFunc(i, 10, 40), fractalSize + noiseFunc(i, 10, 40))
            this.p5.pop()
        }, noiseFunc, preProgress, this.sizeProgress)

        this.fractalProgress += Math.min(audioValue * 10, 1.0)
    }

    private audioNoise(audio: number) {
        return (i: number, offset: number = 0, amp: number = 1) => amp * this.p5.noise((i / 20) + offset, audio)
    }
}

// Set up the P5 application
let app: App
new P5((p5) => {
    app = new App(p5)
})

// Button handler to start the experience
const startButton = document.getElementById('startButton')
if (startButton) {
    startButton.onclick = () => {
        const introPage = document.getElementById('page')
        if (introPage) {
            introPage.style.display = 'none'
        }
    
        app.start()
    }
}

import P5 from 'p5'
import { readFileSync } from 'fs'

import DimensionAudio from './audio'
import Fractals from './fractals'
import LSystem from './lsystem'
import Particle from './particle'

function delay(time: number) {
    return new Promise((resolve) => { setTimeout(resolve, time) })
}

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
    private textureGraphics?: P5.Graphics

    private state: SketchState = SketchState.None
    private fractalProgress: number = 0

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

            // let textureSize = Math.min(window.innerWidth, window.innerHeight)
            // this.textureGraphics = this.p5.createGraphics(textureSize, textureSize)
            // this.textureGraphics.noStroke()
            // this.textureGraphics.noFill()
        }
    
        this.p5.draw = () => {
            this.p5.background(0)
            if (this.audio) this.audio.update()

            switch (this.state) {
                case SketchState.Listening:
                    if (this.audio && this.audio.getOnsetDetected()) this.drawDots()
                    break
                case SketchState.Particles:
                    if (this.backgroundShader) this.drawBackground(this.backgroundShader)
                    if (this.audio && this.fractalImage) this.drawParticles(this.audio, this.fractalImage)
                    break
                case SketchState.LargeFractal:
                    if (this.fractalImage) this.drawLargeFractal(this.fractalImage)
                    break
                case SketchState.Fractal:
                    if (this.backgroundShader && this.audio) this.drawBackground(this.backgroundShader, this.audio)
                    if (this.audio && this.fractalImage && this.generator) this.drawFractals(this.audio, this.fractalImage, this.generator)
                    break
                case SketchState.Shader:
                    if (this.backgroundShader && this.audio) this.drawBackground(this.backgroundShader, this.audio)
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
        // this.createParticles(this.backgroundParticles, 3, 5)
        // this.state = SketchState.Shader

        this.state = SketchState.Listening

        this.audio = new DimensionAudio((type: Fractals.InstrumentType, seed: DimensionAudio.SeedParameters) => {
            this.generator = new LSystem(Fractals.fractalPresets[Fractals.InstrumentType.Clarinet])

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

        // delay(0).then(() => {
        // }).then(() => delay(0)).then(() => {
        // })
    }

    private createParticles(particlesArray: Particle[], numParticles: number = window.innerWidth / 30, speedFactor: number = 1) {
        for (let i = 0; i < numParticles; i++) {
            particlesArray.push(new Particle(this.p5, window.innerWidth, window.innerHeight, speedFactor))
        }
    }

    private drawParticles(audio: DimensionAudio, fractalImage: P5.Image) {
        const preProgress = Math.min(this.fractalProgress, 51) * 5
        const alpha = (1 - Math.min(this.fractalProgress / 1500, 1.0)) * 255

        this.p5.push()
        this.p5.tint(255, Math.min(preProgress, alpha))
        const audioValue = audio.getVolume()
        for (let particle of this.particles) {
            particle.moveParticle(audioValue)
            particle.draw(fractalImage)
        }
        this.p5.pop()

        this.fractalProgress++
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

    private drawBackground(shader: P5.Shader, audio?: DimensionAudio) {
        for (let particle of this.backgroundParticles) {
            particle.moveParticle(0)
        }

        shader.setUniform('cell0', [this.backgroundParticles[0].position.x, this.backgroundParticles[0].position.y])
        shader.setUniform('cell1', [this.backgroundParticles[1].position.x, this.backgroundParticles[1].position.y])
        shader.setUniform('cell2', [this.backgroundParticles[2].position.x, this.backgroundParticles[2].position.y])

        shader.setUniform('colorBg', [255 / 255, 145 / 255, 54 / 255])
        shader.setUniform('color0', [196 / 255, 84 / 255, 0 / 255])
        shader.setUniform('color1', [209 / 255, 114 / 255, 0 / 255])
        shader.setUniform('color2', [242 / 255, 227 / 255, 214 / 255])

        let alpha = 0
        if (audio) {
            alpha = Math.min(audio.getVolume() * 50, 1.0)
        } else {
            alpha = Math.min(this.fractalProgress / 1500, 1.0)

            if (alpha == 1.0) {
                // Transition to next state
                this.state = SketchState.Fractal
                this.fractalProgress = 0
            }
        }

        shader.setUniform('alpha', alpha)
        shader.setUniform('u_resolution', [window.innerWidth, window.innerHeight])

        this.p5.shader(shader)
        this.p5.rect(0, 0, window.innerWidth, window.innerHeight)
    }

    private drawLargeFractal(fractalImage: P5.Image) {        
        const preProgress = Math.min(this.fractalProgress, 85) * 3
        const postProgress = Math.max(this.fractalProgress - 240, 0)
        const alpha = Math.max(255 - postProgress, 0)

        // Draw image fading in as texture
        // if (preProgress < 256) {
        //     graphics.background(0)
        //     graphics.tint(255, preProgress)
        //     graphics.image(fractalImage, 0, 0, graphics.width, graphics.height)
        // }

        this.p5.push()
        this.p5.tint(255, Math.min(preProgress, alpha))

        if (alpha == 0) {
            this.p5.pop()

            // Transition to next state
            this.state = SketchState.Particles
            this.fractalProgress = 0

            // Create particles for background color and for particle effect
            this.createParticles(this.backgroundParticles, 3, 5)
            this.createParticles(this.particles)
        } else {
            let size = Math.min(window.innerWidth, window.innerHeight)
            size += (postProgress * postProgress) / 8
            this.p5.image(fractalImage, 0, 0, size, size)
            this.p5.pop()
            this.fractalProgress++
        }
    }

    private drawFractals(audio: DimensionAudio, fractalImage: P5.Image, generator: LSystem) {
        const progress = this.fractalProgress / 5000
        const audioValue = audio.getVolume()
        const angle = audioValue * 20 //this.p5.noise(progress * 10) * 20
        this.p5.tint(101, 67, 33)
        generator.generate((x, y, a, i) => {
            this.p5.push()
            this.p5.translate(x, y)
            this.p5.rotate(a + 2 * this.p5.noise(i + 10, progress * angle))
            this.p5.image(fractalImage, 0, 0, 50 + 10 * this.p5.noise(i + 10, progress * angle), 50 + 10 * this.p5.noise(i + 10, progress * angle))
            this.p5.pop()
        }, progress, angle, this.p5.noise)

        this.fractalProgress++
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

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
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            }

            // Set up shader
            const vert = readFileSync(__dirname + '/static/shader.vert', 'utf8')
            const frag = readFileSync(__dirname + '/static/shader.frag', 'utf8')
            // const textureVert = readFileSync(__dirname + '/static/textureShader.vert', 'utf8')
            // const textureFrag = readFileSync(__dirname + '/static/textureShader.frag', 'utf8')
            this.backgroundShader = this.p5.createShader(vert, frag)

            let textureSize = Math.min(window.innerWidth, window.innerHeight)
            this.textureGraphics = this.p5.createGraphics(textureSize, textureSize)
            this.textureGraphics.noStroke()
            this.textureGraphics.noFill()
        }
    
        this.p5.draw = () => {
            this.p5.background(0)
            if (this.audio) this.audio.update()

            switch (this.state) {
                case SketchState.Listening:
                    if (this.audio && this.audio.getOnsetDetected()) this.drawDots()
                    break
                case SketchState.Particles:
                    if (this.audio) this.drawParticles(this.audio)
                    break
                case SketchState.LargeFractal:
                    if (this.fractalImage && this.textureGraphics) 
                        this.drawLargeFractal(this.fractalImage, this.textureGraphics)
                    break
                case SketchState.Fractal:
                    if (!this.audio || !this.generator) break
                    this.drawFractals(this.audio, this.generator)
                    break
                case SketchState.Shader:
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
        this.createParticles(3, 5)

        this.state = SketchState.Listening
        this.audio = new DimensionAudio((type: Fractals.InstrumentType, seed: DimensionAudio.SeedParameters) => {
            this.generator = new LSystem(Fractals.fractalPresets[Fractals.InstrumentType.Clarinet])

            let params = ''
            for (let i = 0; i < seed.weights.length; i++) {
                params += `w${i}=${seed.weights[i]}&`
            }
            for (let i = 0; i < seed.moves.length; i++) {
                params += `m${i}=${seed.moves[i]}&`
            }
            this.fractalImage = this.p5.loadImage(`https://pe6ulsde12.execute-api.us-east-2.amazonaws.com/default/MusicFractalBot?${params}`, () => {
                this.state = SketchState.LargeFractal
            })
        })

        // delay(0).then(() => {
        // }).then(() => delay(0)).then(() => {
        // })
    }

    private createParticles(numParticles: number = window.innerWidth / 5, speedFactor: number = 1) {
        for (let i = 0; i < numParticles; i++) {
            this.particles.push(new Particle(this.p5, window.innerWidth, window.innerHeight, speedFactor))
        }
    }

    private drawParticles(audio: DimensionAudio) {
        const audioValue = audio.getVolume()
        for (let particle of this.particles) {
            particle.moveParticle(audioValue)
            particle.draw()
        }
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

    private drawBackground(shader: P5.Shader) {
        for (let particle of this.particles) {
            particle.moveParticle(0)
        }

        shader.setUniform('cell0', [this.particles[0].position.x, this.particles[0].position.y])
        shader.setUniform('cell1', [this.particles[1].position.x, this.particles[1].position.y])
        shader.setUniform('cell2', [this.particles[2].position.x, this.particles[2].position.y])

        shader.setUniform('colorBg', [255 / 255, 145 / 255, 54 / 255])
        shader.setUniform('color0', [196 / 255, 84 / 255, 0 / 255])
        shader.setUniform('color1', [209 / 255, 114 / 255, 0 / 255])
        shader.setUniform('color2', [242 / 255, 227 / 255, 214 / 255])

        shader.setUniform('alpha', this.p5.frameCount / 10000)
        shader.setUniform('u_resolution', [window.innerWidth, window.innerHeight])

        this.p5.shader(shader)
        this.p5.rect(0, 0, window.innerWidth, window.innerHeight)
    }

    private drawLargeFractal(fractalImage: P5.Image, graphics: P5.Graphics) {        
        const preProgress = Math.min(this.fractalProgress, 255)
        const postProgress = Math.max(this.fractalProgress - 255, 0)

        graphics.background(0)
        graphics.tint(255, preProgress)
        graphics.image(fractalImage, 0, 0, graphics.width, graphics.height)
        
        // this.p5.background(0)
        this.p5.texture(graphics)
        let size = Math.min(window.innerWidth, window.innerHeight)
        size -= postProgress * 5
        size = Math.max(size, 0)
        this.p5.rect(0, 0, size, size)

        this.fractalProgress++
    }

    private drawFractals(audio: DimensionAudio, generator: LSystem) {
        this.p5.background(0) //, 100)
        const progress = this.fractalProgress / 5000
        const audioValue = audio.getVolume()
        const angle = audioValue * 20 //this.p5.noise(progress * 10) * 20
        generator.generate((x, y, a, i) => {
            if (!this.fractalImage) return

            this.p5.push()
            this.p5.translate(x, y)
            this.p5.rotate(a + 2 * this.p5.noise(i + 10, progress * angle))
            // this.p5.texture(this.fractalImage);
            // this.p5.plane(50, 50);
            // this.p5.tint('brown')
            this.p5.image(this.fractalImage, 0, 0, 50 + 10 * this.p5.noise(i + 10, progress * angle), 50 + 10 * this.p5.noise(i + 10, progress * angle))
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

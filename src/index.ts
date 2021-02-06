import P5 from 'p5'

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
    FadeOut,
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
    private shader?: P5.Shader

    private state: SketchState = SketchState.None
    private fractalProgress: number = 0

    constructor(p5: P5) {
        this.p5 = p5
        this.particles = []

        this.p5.preload = () => {
            this.shader = this.p5.loadShader('shader.vert', 'shader.frag');
        }
    
        this.p5.setup = () => {
            this.p5.createCanvas(window.innerWidth, window.innerHeight, this.p5.WEBGL)
            this.p5.imageMode(this.p5.CENTER)
            this.p5.frameRate(24)

            // Disable depth test to render elements in order of draw
            const canvas = document.getElementById('defaultCanvas0') as HTMLCanvasElement
            const gl = canvas?.getContext('webgl')
            if (gl) {
                gl.disable(gl.DEPTH_TEST)
                gl.enable(gl.BLEND)
            }
        }
    
        this.p5.draw = () => {
            if (this.audio) this.audio.update()

            switch (this.state) {
                case SketchState.Listening:
                    if (!this.audio) break
                    this.drawParticles(this.audio)
                    break
                case SketchState.FadeOut:
                    this.p5.background(0, 20)
                    break
                case SketchState.LargeFractal:
                    if (!this.fractalImage) break
                    this.drawLargeFractal(this.fractalImage)
                    break
                case SketchState.Fractal:
                    if (!this.audio || !this.generator) break
                    this.drawFractals(this.audio, this.generator)
                    break
                case SketchState.Shader:
                    if (!this.shader || !this.audio || !this.generator) break

                    const audioValue = this.audio.getVolume()
                    for (let particle of this.particles) {
                        particle.moveParticle(0)
                    }

                    this.shader.setUniform('cell0', [this.particles[0].position.x, this.particles[0].position.y])
                    this.shader.setUniform('cell1', [this.particles[1].position.x, this.particles[1].position.y])
                    this.shader.setUniform('cell2', [this.particles[2].position.x, this.particles[2].position.y])

                    this.shader.setUniform('colorBg', [255 / 255, 145 / 255, 54 / 255])
                    this.shader.setUniform('color0', [196 / 255, 84 / 255, 0 / 255])
                    this.shader.setUniform('color1', [209 / 255, 114 / 255, 0 / 255])
                    this.shader.setUniform('color2', [242 / 255, 227 / 255, 214 / 255])

                    this.shader.setUniform('u_resolution', [window.innerWidth, window.innerHeight])

                    this.p5.shader(this.shader)
                    this.p5.rect(0, 0, window.innerWidth, window.innerHeight)

                    this.drawFractals(this.audio, this.generator)

                    break
                case SketchState.None:
                    this.p5.background(0)
                    break
            }
        }
    
        this.p5.windowResized = () => { 
            this.p5.resizeCanvas(window.innerWidth, window.innerHeight)
        }
    }

    public start() {
        this.state = SketchState.Listening
        this.audio = new DimensionAudio()
        this.createParticles() //3, 5)
        // this.generator = new LSystem(Fractals.fractalPresets[Fractals.InstrumentType.Clarinet])
        // this.fractalImage = this.p5.loadImage('https://i.imgur.com/sNZ2Jv7.png')

        delay(35000).then(() => {
            // Fade out particles
            this.state = SketchState.LargeFractal

            // TODO: get fractal type and image from audio
            this.generator = new LSystem(Fractals.fractalPresets[Fractals.InstrumentType.Clarinet])
            this.fractalImage = this.p5.loadImage('https://i.imgur.com/sNZ2Jv7.png')

        }).then(() => delay(0)).then(() => {
            // this.state = SketchState.LargeFractal
        }).then(() => delay(8000)).then(() => {
            this.state = SketchState.Fractal
        }).then(() => delay(2000)).then(() => {
            // this.state = SketchState.Fractal
        })
    }

    private createParticles(numParticles: number = window.innerWidth / 5, speedFactor: number = 1) {
        for (let i = 0; i < numParticles; i++) {
            this.particles.push(new Particle(this.p5, window.innerWidth, window.innerHeight, speedFactor))
        }
    }

    private drawParticles(audio: DimensionAudio) {
        this.p5.background(0)
        const audioValue = audio.getVolume()
        for (let particle of this.particles) {
            particle.moveParticle(audioValue)
            particle.draw()
        }
    }

    private drawLargeFractal(fractalImage: P5.Image) {
        this.p5.background(0) //, 30)
        const size = Math.min(window.innerWidth, window.innerHeight)
        this.p5.push()
        // this.p5.tint(255, 50)
        this.p5.image(fractalImage, 0, 0, size, size)
        this.p5.pop()
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

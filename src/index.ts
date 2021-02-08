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
    Fractal
}

class App {
    private p5: P5
    private particles: Particle[]
    private audio?: DimensionAudio
    private generator?: LSystem
    private fractalImage?: P5.Image

    private state: SketchState = SketchState.None
    private fractalProgress: number = 0

    constructor(p5: P5) {
        this.p5 = p5
        this.particles = []
    
        this.p5.setup = () => {
            this.p5.createCanvas(window.innerWidth, window.innerHeight)
            this.p5.imageMode(this.p5.CENTER)
            this.p5.frameRate(24)
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
                    this.p5.background(0, 100)
                    if (!this.generator) break
                    const progress = this.fractalProgress / 5000
                    const angle = this.p5.noise(progress * 10) * 20
                    this.generator.generate((x, y, a) => {
                        if (!this.fractalImage) return

                        this.p5.push()
                        this.p5.translate(x, y)
                        this.p5.rotate(a)
                        this.p5.image(this.fractalImage, 0, 0, 50, 50)
                        this.p5.pop()
                    }, progress, angle)

                    this.fractalProgress++
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
        this.createParticles()

        delay(3000).then(() => {
            // Fade out particles
            this.state = SketchState.FadeOut

            // TODO: get fractal type and image from audio
            this.generator = new LSystem(Fractals.fractalPresets[Fractals.InstrumentType.Clarinet])
            this.fractalImage = this.p5.loadImage('https://i.imgur.com/sNZ2Jv7.png')

        }).then(() => delay(1000)).then(() => {
            this.state = SketchState.LargeFractal
        }).then(() => delay(8000)).then(() => {
            this.state = SketchState.FadeOut
        }).then(() => delay(2000)).then(() => {
            this.state = SketchState.Fractal
        })
    }

    private createParticles() {
        for (let i = 0; i < window.innerWidth / 5; i++) {
            this.particles.push(new Particle(this.p5, window.innerWidth, window.innerHeight))
        }
    }

    private drawParticles(audio: DimensionAudio) {
        this.p5.background(0, 100)
        const audioValue = Math.min(Math.max(0, audio.getVolume() - 127.5) / 20, 1)
        for (let particle of this.particles) {
            particle.moveParticle(audioValue)
            particle.draw()
        }
    }

    private drawLargeFractal(fractalImage: P5.Image) {
        this.p5.background(0, 30)
        const size = Math.min(window.innerWidth, window.innerHeight)
        this.p5.push()
        this.p5.tint(255, 50)
        this.p5.image(fractalImage, window.innerWidth / 2, window.innerHeight / 2, size, size)
        this.p5.pop()
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

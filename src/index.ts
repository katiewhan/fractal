import P5 from 'p5'

import DimensionAudio from './audio'
import Fractals from './fractals'
import LSystem from './lsystem'
import Particle from './particle'

enum SketchState {
    None,
    Listening,
    FadeOut,
    LargeFractal,
    Fractal
}

class App {
    private state: SketchState = SketchState.None
    private p5: P5

    private particles: Particle[]
    private audio?: DimensionAudio
    private generator?: LSystem
    private fractalImage?: P5.Image

    private fractalProgress: number = 0

    constructor(p5: P5) {
        this.p5 = p5
        this.particles = []
    
        this.p5.setup = () => {
            this.p5.createCanvas(window.innerWidth, window.innerHeight)
            this.p5.imageMode(this.p5.CENTER)
        }
    
        this.p5.draw = () => {
            switch (this.state) {
                case SketchState.Listening:
                    if (!this.audio) break
                    this.audio.update()
                    this.drawParticles(this.audio)
                    break
                case SketchState.FadeOut:
                    this.p5.background(0, 20)
                    break
                case SketchState.LargeFractal:
                    this.p5.background(0, 30)
                    if (!this.fractalImage) break
                    const size = Math.min(window.innerWidth, window.innerHeight)
                    this.p5.push()
                    this.p5.tint(255, 50)
                    this.p5.image(this.fractalImage, window.innerWidth / 2, window.innerHeight / 2, size, size)
                    this.p5.pop()
                    break
                case SketchState.Fractal:
                    this.p5.background(0, 100)
                    if (!this.generator) break
                    const progress = this.fractalProgress / 5000
                    this.generator.generate((x, y, a) => {
                        if (!this.fractalImage) return

                        this.p5.push()
                        this.p5.translate(x, y)
                        this.p5.rotate(a)
                        this.p5.image(this.fractalImage, 0, 0, 50, 50)
                        this.p5.pop()
                    }, progress)

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

        setTimeout(() => {
            // Fade out particles
            this.state = SketchState.FadeOut

            this.generator = new LSystem(Fractals.fractalPresets[Fractals.InstrumentType.Clarinet])
            this.fractalImage = this.p5.loadImage('https://i.imgur.com/sNZ2Jv7.png')

            setTimeout(() => {
                this.state = SketchState.LargeFractal

                setTimeout(() => {
                    this.state = SketchState.FadeOut

                    setTimeout(() => {
                        this.state = SketchState.Fractal
                    }, 3000)

                }, 7000)

            }, 1000)

        }, 30000)
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

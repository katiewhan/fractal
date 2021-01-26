import P5 from 'p5'
import DimensionAudio from './audio'
import LSystem from './lsystem'
import Particle from './particle'

enum SketchState {
    None,
    Listening,
    FadeOut,
    Fractal
}

class App {
    private state: SketchState = SketchState.None
    private p5: P5

    private generator: LSystem
    private particles: Particle[]
    private audio?: DimensionAudio
    private fractalImage?: P5.Image

    constructor(p5: P5) {
        this.p5 = p5

        this.generator = new LSystem()
        this.particles = []

        this.p5.preload = () => {
            this.fractalImage = this.p5.loadImage('https://i.imgur.com/sNZ2Jv7.png')
        }
    
        this.p5.setup = () => {
            this.p5.createCanvas(window.innerWidth, window.innerHeight)
        }
    
        this.p5.draw = () => {
            switch (this.state) {
                case SketchState.Listening:
                    this.p5.background(0, 100)

                    if (!this.audio) break

                    this.audio.update()
                    const audioValue = Math.min(Math.max(0, this.audio.getVolume() - 127.5) / 20, 1)
                    for (let particle of this.particles) {
                        particle.moveParticle(audioValue)
                        particle.draw()
                    }
                    break
                case SketchState.FadeOut:
                    this.p5.background(0, 30)
                    break
                case SketchState.Fractal:
                    this.p5.background(0, 100)
                    // this.generator.generate((x, y, dir) => {
                        if (this.fractalImage)
                            this.p5.image(this.fractalImage, 0, 0, 1000, 1000)
                    // })
                    break
                case SketchState.None:
                    this.p5.background(0)
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

            setTimeout(() => {
                // this.generator.iterate(3)
                this.state = SketchState.Fractal
            }, 1000)

        }, 30000)
    }

    private createParticles() {
        for (let i = 0; i < window.innerWidth / 5; i++) {
            this.particles.push(new Particle(this.p5, window.innerWidth, window.innerHeight))
        }
    }
}

// Start the P5 application
let app: App
new P5((p5) => {
    app = new App(p5)
})

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

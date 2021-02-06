import P5 from 'p5'

interface Point {
    x: number
    y: number
}

class Particle {
    private p5: P5
    public position: Point
    private radius: number
    private speed: Point
    private color: P5.Color
    
    constructor(p5: P5, width: number, height: number, speedFactor: number = 1) {
        this.p5 = p5
        this.position = { x: this.p5.random(- width / 2, width / 2), y: this.p5.random(- height / 2, height / 2) }
        this.radius = this.p5.random(3, 9);
        this.speed = { x: this.p5.random(-2 * speedFactor, 2 * speedFactor), y: this.p5.random(-2 * speedFactor, 2 * speedFactor) }
        this.color = this.p5.color(this.p5.random(200, 255), 200)
    }

    public draw() {
        this.p5.noStroke()
        this.p5.fill(this.color)
        this.p5.circle(this.position.x, this.position.y, this.radius)
    }

    public moveParticle(noise: number) {
        if (this.position.x < (- this.p5.width / 2) || this.position.x > this.p5.width / 2)
            this.speed.x *= -1
        if (this.position.y < (- this.p5.height / 2) || this.position.y > this.p5.height / 2)
            this.speed.y *= -1

        const xDelta = - this.position.x //(this.p5.width / 2) - this.position.x
        const yDelta = - this.position.y // (this.p5.height / 2) - this.position.y
        const xRandomNoise = noise * this.p5.randomGaussian(0, 1)
        const yRandomNoise = noise * this.p5.randomGaussian(0, 1)

        this.position.x += this.speed.x + (xRandomNoise * xDelta)
        this.position.y += this.speed.y + (yRandomNoise * yDelta)
    }
}

export default Particle
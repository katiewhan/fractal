interface LRules {
    [key: string]: string
}

interface LState {
    x: number
    y: number
    direction: number
}

class LSystem {
    private axiom: string
    private rules: LRules
    private distance: number
    private angle: number

    private fullPath: string = ''

    constructor() {
        this.distance = 20
        this.angle = 90
        this.rules = { 'F' : 'FF+F+F+F+F+F-F' } //{ 'X': 'F+[[X]-X]-F[-FX]+X', 'F': 'FF' } //{ 'X': 'X+YF+', 'Y': '-FX-Y' }
        this.axiom = 'F+F+F+F'
    }

    public iterate(iterations: number): void {
        let current = this.axiom
        for (let i = 0; i < iterations; i++) {
            let next = ''
            for (const c of current) {
                if (this.rules[c]) {
                    next += this.rules[c]
                } else {
                    next += c
                }
            }
            current = next
        }

        this.fullPath = current
    }

    public generate(draw: (x: number, y: number, dir: number) => void): void {
        let states: LState[] = [{ x: 600, y: 0, direction: 0 }]

        for (let p of this.fullPath) {
            let currentState = states[states.length - 1]

            switch (p) {
                case 'F':
                    let directionRad = currentState.direction * Math.PI / 180
                    currentState.x += this.distance * Math.cos(directionRad)
                    currentState.y += this.distance * Math.sin(directionRad)

                    draw(currentState.x, currentState.y, directionRad)
                    // console.log(states)
                    // this.ctx.beginPath();
                    // this.ctx.strokeStyle = "red";
                    // this.ctx.save()
                    // this.ctx.translate(currentState.x, currentState.y)
                    // this.ctx.rotate(directionRad)
                    // // this.ctx.rect(0, 0, 50, 50)
                    // // this.ctx.stroke();
                    // this.ctx.drawImage(this.image, 0, 0, 30, 30)
                    // this.ctx.restore()

                    // this.app.scene.addImage(currentState.x, currentState.y, directionRad)

                    break
                case 'f':
                    break
                case '+':
                    currentState.direction += this.angle
                    break
                case '-':
                    currentState.direction -= this.angle
                    break
                case '[':
                    states.push({ x: currentState.x, y: currentState.y, direction: currentState.direction })
                    break
                case ']':
                    states.pop()
                    break

            }
        }
    }
}

export default LSystem
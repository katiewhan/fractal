interface LRules {
    [key: string]: string
}

interface LState {
    x: number
    y: number
    direction: number
}

interface LPreset {
    initialState: LState
    rules: LRules
    axiom: string
    distance: number
    angle: number
    numIteration: number
}

class LSystem {
    private axiom: string
    private rules: LRules
    private distance: number
    private angle: number
    private initialState: LState

    private fullPath: string = ''

    constructor(preset: LPreset) {
        this.distance = preset.distance
        this.angle = preset.angle
        this.rules = preset.rules
        this.axiom = preset.axiom
        this.initialState = preset.initialState

        this.iterate(preset.numIteration)
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

    public generate(draw: (x: number, y: number, dir: number) => void, progress: number = 1, angleOffset: number = 0): void {
        let states: LState[] = [{ x: this.initialState.x, y: this.initialState.y, direction: this.initialState.direction }]

        const pathLength = Math.floor(this.fullPath.length * progress)
        console.log(pathLength)
        console.log(this.fullPath.length)

        for (let i = 0; i < pathLength; i++) {
            let currentState = states[states.length - 1]

            switch (this.fullPath[i]) {
                case 'F':
                    let directionRad = currentState.direction * Math.PI / 180
                    currentState.x += this.distance * Math.cos(directionRad)
                    currentState.y += this.distance * Math.sin(directionRad)

                    draw(currentState.x, currentState.y, directionRad)
                    break
                case 'f':
                    break
                case '+':
                    currentState.direction += this.angle + angleOffset
                    break
                case '-':
                    currentState.direction -= this.angle + angleOffset
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
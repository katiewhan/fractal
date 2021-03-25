import Fractals from './fractals'

class LSystem {
    public size: number

    private axiom: string
    private rules: Fractals.LRules
    private distance: number
    private angle: number
    private initialState: Fractals.LState

    private fullPath: string = ''

    constructor(preset: Fractals.LPreset) {
        this.size = preset.distance

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

    public generate(
        draw: (x: number, y: number, dir: number, index: number) => void, 
        noise: (i: number, o?: number, a?: number) => number,
        progress: number = 1, 
        distanceOffset: number = 0
    ): void {
        let states: Fractals.LState[] = [{ x: this.initialState.x, y: this.initialState.y, direction: this.initialState.direction }]

        const pathLength = Math.floor(this.fullPath.length * progress)

        for (let i = 0; i < pathLength; i++) {
            let currentState = states[states.length - 1]
            let directionRad = currentState.direction * Math.PI / 180
            let currentDistance = this.distance + distanceOffset

            switch (this.fullPath[i]) {
                case 'F':
                    currentState.x += (currentDistance + noise(i, 100, 40)) * Math.cos(directionRad)
                    currentState.y += (currentDistance + noise(i, 1000, 40)) * Math.sin(directionRad)

                    draw(currentState.x, currentState.y, directionRad, i)
                    break
                case 'f':
                    currentState.x += (currentDistance + noise(i, 100, 40)) * Math.cos(directionRad)
                    currentState.y += (currentDistance + noise(i, 1000, 40)) * Math.sin(directionRad)
                    break
                case '+':
                    currentState.direction += (this.angle + noise(i))
                    break
                case '-':
                    currentState.direction -= (this.angle + noise(i))
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

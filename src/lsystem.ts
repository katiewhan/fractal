import Fractals from './fractals'

class LSystem {
    private axiom: string
    private rules: Fractals.LRules
    private distance: number
    private angle: number
    private initialState: Fractals.LState

    private fullPath: string = ''

    constructor(preset: Fractals.LPreset) {
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

    public generate(draw: (x: number, y: number, dir: number, index: number) => void, progress: number = 1, angleOffset: number = 0, noise: (x: number, y: number) => number): void {
        let states: Fractals.LState[] = [{ x: this.initialState.x, y: this.initialState.y, direction: this.initialState.direction }]

        const pathLength = Math.floor(this.fullPath.length * progress)

        for (let i = 0; i < pathLength; i++) {
            let currentState = states[states.length - 1]

            switch (this.fullPath[i]) {
                case 'F':
                    let directionRad = currentState.direction * Math.PI / 180
                    currentState.x += (this.distance + 10 * noise(i + 100, progress * angleOffset)) * Math.cos(directionRad)
                    currentState.y += (this.distance + 10 * noise(i + 1000, progress * angleOffset)) * Math.sin(directionRad)

                    draw(currentState.x, currentState.y, directionRad, i)
                    break
                case 'f':
                    break
                case '+':
                    currentState.direction += (this.angle + 10 * noise(i, progress * angleOffset))
                    break
                case '-':
                    currentState.direction -= (this.angle + 10 * noise(i, progress * angleOffset))
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

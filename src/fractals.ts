namespace Fractals {
    export interface LRules {
        [key: string]: string
    }
    
    export interface LState {
        x: number
        y: number
        direction: number
    }

    export interface LPreset {
        initialState: LState
        rules: LRules
        axiom: string
        distance: number
        angle: number
        numIteration: number
    }

    export interface Color {
        r: number
        g: number
        b: number
    }

    export interface InstrumentPreset {
        lSystem: LPreset
        backgroundColors: Color[]
        foregroundColor: Color
    }

    export enum InstrumentType {
        Clarinet,
        Flute,
        Horn,
        Bassoon,
        Euphonium,
        PitchedPercussion,
        NonPitchedPercussion,
        Oboe,
        Piano,
        Saxes,
        Trumpet,
        Trombone,
        Tuba
    }
    
    export type PresetMapping = {
        [key in InstrumentType]: InstrumentPreset
    }
    
    export const fractalPresets: PresetMapping = {
        [InstrumentType.Clarinet]: {
            lSystem: {
                initialState: {
                    x: - (window.innerWidth / 2 + 400),
                    y: window.innerHeight / 2 + 400,
                    direction: -40
                },
                rules: { 
                    'F': 'FF[+FF]FF[-FF][FF]',
                },
                axiom: 'F',
                distance: 25,
                angle: 30,
                numIteration: 4
            },
            backgroundColors: [{ r: 255, g: 145, b: 54}, { r: 196, g: 84, b: 0 }, { r: 209, g: 114, b: 0 }, { r: 242, g: 227, b: 214 }],
            foregroundColor: { r: 101, g: 67, b: 33}
        },
        [InstrumentType.Flute]: {
            lSystem: {
                initialState: {
                    x: -window.innerWidth / 4,
                    y: -window.innerHeight / 2,
                    direction: -30
                },
                rules: { 
                    'F': 'F-fF+fF+F+f-F-fF+F+f-F-fF-fF+F',
                },
                axiom: 'F+F+F+F',
                distance: 20,
                angle: 90,
                numIteration: 2
            },
            backgroundColors: [{ r: 132, g: 169, b: 212}, { r: 151, g: 161, b: 179 }, { r: 103, g: 131, b: 161 }, { r: 66, g: 93, b: 124 }],
            foregroundColor: { r: 45, g: 70, b: 102 }
        },
        [InstrumentType.Horn]: {
            lSystem: {
                initialState: {
                    x: -window.innerWidth / 4,
                    y: -window.innerHeight / 2,
                    direction: -30
                },
                rules: { 
                    'F': 'F-fF+fF+F+f-F-fF+F+f-F-fF-fF+F',
                },
                axiom: 'F+F+F+F',
                distance: 20,
                angle: 90,
                numIteration: 2
            },
            backgroundColors: [{ r: 132, g: 169, b: 212}, { r: 151, g: 161, b: 179 }, { r: 103, g: 131, b: 161 }, { r: 66, g: 93, b: 124 }],
            foregroundColor: { r: 45, g: 70, b: 102 }
        },
        [InstrumentType.Bassoon]: {
            lSystem: {
                initialState: {
                    x: -window.innerWidth / 4,
                    y: -window.innerHeight / 2,
                    direction: -30
                },
                rules: { 
                    'F': 'F-fF+fF+F+f-F-fF+F+f-F-fF-fF+F',
                },
                axiom: 'F+F+F+F',
                distance: 20,
                angle: 90,
                numIteration: 2
            },
            backgroundColors: [{ r: 132, g: 169, b: 212}, { r: 151, g: 161, b: 179 }, { r: 103, g: 131, b: 161 }, { r: 66, g: 93, b: 124 }],
            foregroundColor: { r: 45, g: 70, b: 102 }
        },
        [InstrumentType.Euphonium]: {
            lSystem: {
                initialState: {
                    x: - (window.innerWidth / 2 + 400),
                    y: window.innerHeight / 2 + 400,
                    direction: -40
                },
                rules: { 
                    'F': 'FF[+FF]FF[-FF][FF]',
                },
                axiom: 'F',
                distance: 25,
                angle: 30,
                numIteration: 4
            },
            backgroundColors: [{ r: 255, g: 145, b: 54}, { r: 196, g: 84, b: 0 }, { r: 209, g: 114, b: 0 }, { r: 242, g: 227, b: 214 }],
            foregroundColor: { r: 101, g: 67, b: 33}
        },
        [InstrumentType.PitchedPercussion]: {
            lSystem: {
                initialState: {
                    x: - (window.innerWidth / 2 + 400),
                    y: window.innerHeight / 2 + 400,
                    direction: -40
                },
                rules: { 
                    'F': 'FF[+FF]FF[-FF][FF]',
                },
                axiom: 'F',
                distance: 25,
                angle: 30,
                numIteration: 4
            },
            backgroundColors: [{ r: 255, g: 145, b: 54}, { r: 196, g: 84, b: 0 }, { r: 209, g: 114, b: 0 }, { r: 242, g: 227, b: 214 }],
            foregroundColor: { r: 101, g: 67, b: 33}
        },
        [InstrumentType.NonPitchedPercussion]: {
            lSystem: {
                initialState: {
                    x: - (window.innerWidth / 2 + 400),
                    y: window.innerHeight / 2 + 400,
                    direction: -40
                },
                rules: { 
                    'F': 'FF[+FF]FF[-FF][FF]',
                },
                axiom: 'F',
                distance: 25,
                angle: 30,
                numIteration: 4
            },
            backgroundColors: [{ r: 255, g: 145, b: 54}, { r: 196, g: 84, b: 0 }, { r: 209, g: 114, b: 0 }, { r: 242, g: 227, b: 214 }],
            foregroundColor: { r: 101, g: 67, b: 33}
        },
        [InstrumentType.Oboe]: {
            lSystem: {
                initialState: {
                    x: - (window.innerWidth / 2 + 400),
                    y: window.innerHeight / 2 + 400,
                    direction: -40
                },
                rules: { 
                    'F': 'FF[+FF]FF[-FF][FF]',
                },
                axiom: 'F',
                distance: 25,
                angle: 30,
                numIteration: 4
            },
            backgroundColors: [{ r: 255, g: 145, b: 54}, { r: 196, g: 84, b: 0 }, { r: 209, g: 114, b: 0 }, { r: 242, g: 227, b: 214 }],
            foregroundColor: { r: 101, g: 67, b: 33}
        },
        [InstrumentType.Piano]: {
            lSystem: {
                initialState: {
                    x: -window.innerWidth / 4,
                    y: -window.innerHeight / 2,
                    direction: -30
                },
                rules: { 
                    'F': 'F-fF+fF+F+f-F-fF+F+f-F-fF-fF+F',
                },
                axiom: 'F+F+F+F',
                distance: 20,
                angle: 90,
                numIteration: 2
            },
            backgroundColors: [{ r: 132, g: 169, b: 212}, { r: 151, g: 161, b: 179 }, { r: 103, g: 131, b: 161 }, { r: 66, g: 93, b: 124 }],
            foregroundColor: { r: 45, g: 70, b: 102 }
        },
        [InstrumentType.Saxes]: {
            lSystem: {
                initialState: {
                    x: - (window.innerWidth / 2 + 400),
                    y: window.innerHeight / 2 + 400,
                    direction: -40
                },
                rules: { 
                    'F': 'FF[+FF]FF[-FF][FF]',
                },
                axiom: 'F',
                distance: 25,
                angle: 30,
                numIteration: 4
            },
            backgroundColors: [{ r: 255, g: 145, b: 54}, { r: 196, g: 84, b: 0 }, { r: 209, g: 114, b: 0 }, { r: 242, g: 227, b: 214 }],
            foregroundColor: { r: 101, g: 67, b: 33}
        },
        [InstrumentType.Trumpet]: {
            lSystem: {
                initialState: {
                    x: - (window.innerWidth / 2 + 400),
                    y: window.innerHeight / 2 + 400,
                    direction: -40
                },
                rules: { 
                    'F': 'FF[+FF]FF[-FF][FF]',
                },
                axiom: 'F',
                distance: 25,
                angle: 30,
                numIteration: 4
            },
            backgroundColors: [{ r: 255, g: 145, b: 54}, { r: 196, g: 84, b: 0 }, { r: 209, g: 114, b: 0 }, { r: 242, g: 227, b: 214 }],
            foregroundColor: { r: 101, g: 67, b: 33}
        },
        [InstrumentType.Trombone]: {
            lSystem: {
                initialState: {
                    x: - (window.innerWidth / 2 + 400),
                    y: window.innerHeight / 2 + 400,
                    direction: -40
                },
                rules: { 
                    'F': 'FF[+FF]FF[-FF][FF]',
                },
                axiom: 'F',
                distance: 25,
                angle: 30,
                numIteration: 4
            },
            backgroundColors: [{ r: 255, g: 145, b: 54}, { r: 196, g: 84, b: 0 }, { r: 209, g: 114, b: 0 }, { r: 242, g: 227, b: 214 }],
            foregroundColor: { r: 101, g: 67, b: 33}
        },
        [InstrumentType.Tuba]: {
            lSystem: {
                initialState: {
                    x: - (window.innerWidth / 2 + 400),
                    y: window.innerHeight / 2 + 400,
                    direction: -40
                },
                rules: { 
                    'F': 'FF[+FF]FF[-FF][FF]',
                },
                axiom: 'F',
                distance: 25,
                angle: 30,
                numIteration: 4
            },
            backgroundColors: [{ r: 255, g: 145, b: 54}, { r: 196, g: 84, b: 0 }, { r: 209, g: 114, b: 0 }, { r: 242, g: 227, b: 214 }],
            foregroundColor: { r: 101, g: 67, b: 33}
        }
    }
}

export default Fractals

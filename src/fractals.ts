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
                    x: - (window.innerWidth / 2),
                    y: window.innerHeight / 2,
                    direction: -40
                },
                rules: { 
                    'F': 'FF+[+F-F-F]-[-F+F+F]',
                },
                axiom: 'F',
                distance: 25,
                angle: 24,
                numIteration: 3
            },
            backgroundColors: [{ r: 255, g: 145, b: 54 }, { r: 196, g: 84, b: 0 }, { r: 209, g: 114, b: 0 }, { r: 242, g: 227, b: 214 }],
            foregroundColor: { r: 101, g: 67, b: 33 }
        },
        [InstrumentType.Flute]: {
            lSystem: {
                initialState: {
                    x: window.innerWidth / 2,
                    y: window.innerHeight,
                    direction: -30
                },
                rules: { 
                    'X': 'XF+F+XF--F--XF+F+X',
                },
                axiom: 'F--XF--F--XF',
                distance: 18,
                angle: 44,
                numIteration: 4
            },
            backgroundColors: [{ r: 34, g: 37, b: 46 }, { r: 108, g: 127, b: 155 }, { r: 85, g: 93, b: 101 }, { r: 84, g: 98, b: 138 } ],
            foregroundColor: { r: 213, g: 229, b: 242 }
        },
        [InstrumentType.Horn]: {
            lSystem: {
                initialState: {
                    x: 0,
                    y: 0,
                    direction: 0
                },
                rules: { 
                    'X': 'XF',
                    'Y': 'Y+XF+X+XF+XF+XF+XF'
                },
                axiom: '-Y',
                distance: 40,
                angle: 60,
                numIteration: 10
            },
            backgroundColors: [{ r: 118, g: 110, b: 87 }, { r: 92, g: 89, b: 71 }, { r: 229, g: 235, b: 239 }, { r: 115, g: 112, b: 92 }],
            foregroundColor: { r: 13, g: 13, b: 13 }
        },
        [InstrumentType.Bassoon]: {
            lSystem: {
                initialState: {
                    x: 0,
                    y: 3 * window.innerHeight / 4,
                    direction: -90
                },
                rules: { 
                    'F': 'F[+FF][-FF]F[-F][+F]F',
                },
                axiom: 'F',
                distance: 30,
                angle: 35,
                numIteration: 3
            },
            backgroundColors: [{ r: 185, g: 186, b: 181 }, { r: 229, g: 229, b: 230 }, { r: 205, g: 157, b: 2 }, { r: 242, g: 203, b: 5 }],
            foregroundColor: { r: 62, g: 66, b: 50 }
        },
        [InstrumentType.Euphonium]: {
            lSystem: {
                initialState: {
                    x: 0,
                    y: window.innerHeight,
                    direction: 180
                },
                rules: { 
                    'X': 'XF-F+F-XF+F+XF-F+F-X',
                },
                axiom: 'F+XF+F+XF',
                distance: 25,
                angle: 88,
                numIteration: 3
            },
            backgroundColors: [{ r: 123, g: 156, b: 4 }, { r: 155, g: 180, b: 11 }, { r: 136, g: 161, b: 10 }, { r: 49, g: 83, b: 5 }],
            foregroundColor: { r: 9, g: 38, b: 1 }
        },
        [InstrumentType.PitchedPercussion]: {
            lSystem: {
                initialState: {
                    x: -window.innerWidth / 2 + 100,
                    y: window.innerHeight / 2,
                    direction: 0
                },
                rules: { 
                    'X': '-YFF+XFFX+FFY-',
                    'Y': '+XFF-YFFY-FFX+'
                },
                axiom: 'X',
                distance: 30,
                angle: 90,
                numIteration: 4
            },
            backgroundColors: [{ r: 26, g: 26, b: 26 }, { r: 4, g: 84, b: 87 }, { r: 32, g: 181, b: 186 }, { r: 124, g: 213, b: 216 }],
            foregroundColor: { r: 217, g: 68, b: 54 }
        },
        [InstrumentType.NonPitchedPercussion]: {
            lSystem: {
                initialState: {
                    x: window.innerWidth / 4,
                    y: - window.innerHeight / 2,
                    direction: 0
                },
                rules: { 
                    'X': 'X+YF++YfF-FX--fFXFX-YF+',
                    'Y': '-FX+YFYF++YfF+FX--fFX-Y'
                },
                axiom: 'XF',
                distance: 20,
                angle: 60,
                numIteration: 3
            },
            backgroundColors: [{ r: 60, g: 81, b: 72 }, { r: 145, g: 136, b: 127 }, { r: 70, g: 53, b: 57 }, { r: 87, g: 70, b: 54 }],
            foregroundColor: { r: 189, g: 201, b: 173 }
        },
        [InstrumentType.Oboe]: {
            lSystem: {
                initialState: {
                    x: 0,
                    y: 3 * window.innerHeight / 4,
                    direction: -110
                },
                rules: { 
                    'F': 'FF+[+F-F-F]-[-F+F+F]',
                },
                axiom: 'F',
                distance: 20,
                angle: 22.5,
                numIteration: 3
            },
            backgroundColors: [{ r: 57, g: 87, b: 0 }, { r: 106, g: 135, b: 1 }, { r: 171, g: 171, b: 25 }, { r: 198, g: 179, b: 4 }],
            foregroundColor: { r: 89, g: 2, b: 2 }
        },
        [InstrumentType.Piano]: {
            lSystem: {
                initialState: {
                    // SMH note: (x,y) = (0,0) is center of window,
                    // and I think y axis is flipped?
                    x: 0,
                    y: -window.innerHeight / 2,
                    direction: 90
                },
                rules: { 
                    'V': '[+++W][---W]YV',
                    'W': '+X[-W]Z',
                    'X': '-W[+X]Z',
                    'Y': 'YZ',
                    'Z': '[-FFFFFF][+FFFFFF]F'
                },
                axiom: 'VZFFF',
                distance: 20,
                angle: 20,
                numIteration: 6
            },
            backgroundColors: [{ r: 100, g: 26, b: 62 }, { r: 43, g: 18, b: 89 }, { r: 83, g: 68, b: 152 }, { r: 23, g: 13, b: 54 }],
            foregroundColor: { r: 239, g: 216, b: 242 }
        },
        [InstrumentType.Saxes]: {
            lSystem: {
                initialState: {
                    x: - (window.innerWidth / 2 - 100),
                    y: (window.innerHeight / 2 - 100),
                    direction: -10
                },
                rules: { 
                    'X': 'YF+XF+Y',
                    'Y': 'XF-YF-X'
                },
                axiom: 'YF',
                distance: 25,
                angle: 60,
                numIteration: 5
            },
            backgroundColors: [{ r: 132, g: 102, b: 51 }, { r: 111, g: 93, b: 48 }, { r: 64, g: 27, b: 7 }, { r: 25, g: 15, b: 6 }],
            foregroundColor: { r: 242, g: 213, b: 160 }
        },
        [InstrumentType.Trumpet]: {
            lSystem: {
                initialState: {
                    x: 0,
                    y: 0,
                    direction: 0
                },
                rules: { 
                    'F': 'F++F++[F]+F--F',
                },
                axiom: 'F++F++F++F++F',
                distance: 40,
                angle: 36,
                numIteration: 3
            },
            backgroundColors: [{ r: 2, g: 4, b: 104 }, { r: 31, g: 115, b: 133 }, { r: 17, g: 68, b: 130 }, { r: 37, g: 123, b: 100 }],
            foregroundColor: { r: 235, g: 43, b: 112 }
        },
        [InstrumentType.Trombone]: {
            lSystem: {
                initialState: {
                    x: - window.innerWidth / 4,
                    y: 0,
                    direction: 0
                },
                rules: { 
                    'X': 'X+YF+',
                    'Y': '-FX-Y'
                },
                axiom: 'FX',
                distance: 15,
                angle: 90,
                numIteration: 9
            },
            backgroundColors: [{ r: 67, g: 137, b: 190 }, { r: 87, g: 149, b: 190 }, { r: 11, g: 21, b: 142 }, { r: 1, g: 0, b: 68 }],
            foregroundColor: { r: 199, g: 200, b: 178 }
        },
        [InstrumentType.Tuba]: {
            lSystem: {
                initialState: {
                    x: - window.innerWidth / 2,
                    y: - window.innerHeight / 2,
                    direction: 0
                },
                rules: { 
                    'F': 'FF+F++F+F',
                },
                axiom: 'F+F+F+F',
                distance: 20,
                angle: 90,
                numIteration: 3
            },
            backgroundColors: [{ r: 147, g: 154, b: 167 }, { r: 118, g: 115, b: 102 }, { r: 96, g: 94, b: 97 }, { r: 108, g: 81, b: 63 }],
            foregroundColor: { r: 91, g: 113, b: 104 }
        }
    }
}

export default Fractals

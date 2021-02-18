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
        [key in InstrumentType]: LPreset
    }
    
    export const fractalPresets = {
        [InstrumentType.Clarinet]: {
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
        }
    }
}

export default Fractals

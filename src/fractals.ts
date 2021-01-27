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
                x: 0,
                y: window.innerHeight + 150,
                direction: -50
            },
            rules: { 
                'X': 'F+[[X]-X]-F[-FX]+X',
                'F': 'FF' 
            },
            axiom: 'X',
            distance: 30,
            angle: 30,
            numIteration: 5
        }
    }
}

export default Fractals

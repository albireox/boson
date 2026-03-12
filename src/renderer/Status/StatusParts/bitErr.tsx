/*
 *  @Author: Stephen Pan
 *  @Date: 2026-03-11
 *  @Filename: bitErr.tsx
 *  @License: BSD 3-clause (http://www.opensource.org/licenses/BSD-3-Clause)
 */


export const BitInfoMap = new Map<number, [string, number]>([
    // ErrorBits (severity = 2)
    [6,  ["Reverse limit switch", 2]],
    [7,  ["Forward limit switch", 2]],
    [13, ["Stop button", 2]],
    [2,  ["Reverse software limit", 2]],
    [3,  ["Forward software limit", 2]],
    [11, ["Out of closed loop", 2]],
    [12, ["Amplifier disabled", 2]],
    [24, ["Fiducial error too large", 2]],
    [18, ["Clock not set", 2]],
    [16, ["1 Hz clock signal lost", 2]],
  
    // WarningBits (severity = 1)
    [0,  ["Motor control buffer empty", 1]],
    [1,  ["Position update late", 1]],
    [14, ["Semaphore owned by somebody else", 1]],
    [29, ["Windscreen touch down or cw", 1]],
    [30, ["Windscreen touch up or ccw", 1]],
    [4,  ["Velocity limited", 1]],
    [5,  ["Acceleration limited", 1]],
  ]);


export function toBinary(n: number): string {
    if (!Number.isInteger(n) || n < 0) {
        throw new Error("Input must be a non-negative integer.");
    }
    return n.toString(2)

}

export function parseBitErrors(bitValue: number): string {
    //this function takes in a bit value and returns a string describing the active error and warning bits, 
    // prioritizing errors over warnings
    const binaryString = toBinary(bitValue);
    const activeBits: string[] = [];

    for (let i = 0; i < binaryString.length; i++) {
        if (binaryString[binaryString.length - 1 - i] === '1') {
            const bitInfo = BitInfoMap.get(i);
            if (bitInfo) {
                activeBits.push(bitInfo[0]);
            }
        }
    }

    return activeBits.join(", ");
}

export function parseBitColor(bitValue: number): number {
    //returns one color based on the highest severity bit
    const binaryString = toBinary(bitValue);
    const activeBits: number[] = [];

    for (let i = 0; i < binaryString.length; i++) {
        if (binaryString[binaryString.length - 1 - i] === '1') {
            const bitInfo = BitInfoMap.get(i);
            if (bitInfo) {
                activeBits.push(bitInfo[1]);
            }
        }
    }

    return Math.max(...activeBits, 0);
}



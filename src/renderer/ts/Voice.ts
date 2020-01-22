"use strict"
export enum VOICE {
    WSA = 1, SOFTALK = 2, TAMIYASU = 3, BOUYOMI = 4, VOICETEXT = 5,
}
const MAX_RATE = 1.8;

export class VoiceParameter {
    // default value : WebSpeechApi value
    volume: number = 100;
    rate: number = 10;
    pitch: number = 50;
    use: boolean = false;
    constructor(volume: number = 100, rate: number = 10, pitch: number = 50) {
        this.volume = volume;
        this.rate = rate;
        this.pitch = pitch
    }

    // rate が 100 を超えてしまうのでは？
    quick(magnification: number) {
        let qVParam = new VoiceParameter(this.volume, this.rate, this.pitch);
        qVParam.rate *= (magnification > MAX_RATE ? MAX_RATE : magnification);
        return qVParam;
    }

    adjustVolume(min: number, max: number) {
        return min + (max - min) * this.volume / 100;
    }
    adjustRate(min: number, max: number) {
        return min + (max - min) * this.rate / 100;
    }
    adjustPitch(min: number, max: number) {
        return min + (max - min) * this.pitch / 100;
    }
}

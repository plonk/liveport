import * as cp from "child_process";
import * as os from "os";
import Logger from "./Logger";
import { VoiceParameter } from "./Voice"
import { Speaker } from "./Speaker"
const defaultParameter = {
    volume: 50,
    rate: 100,
    pitch: 100
}
class Tamiyasu implements Speaker {
    path: string = "";
    _speaking = false;

    constructor(path: string) {
        this.path = path;
    }
    // Tamiyasuは読み上げ終了を検知出来ない
    speak(text: string, vParam: VoiceParameter) {
        var args = text.replace(/\n/gi, "  ");
        this._speaking = true;
        cp.spawn(this.path, [args]).on("exit", (code) => {
            Logger.log("result", code);
        }).on("error", (err) => {
            Logger.log("result", err.name);
            process.exit(1);
        });
    }

    cancel() {
        this._speaking = false;
    }

    speaking() {
        return this._speaking;
    }

    public static calcStringSize(text: string, timeLimit: number) {
        let limitSize = timeLimit * readPerSecondWord;
        return text.substring(0, limitSize);
    }
}
const readPerSecondWord = 4;
export default Tamiyasu;

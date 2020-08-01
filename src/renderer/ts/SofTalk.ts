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
class SofTalk implements Speaker {
    path: string = "";
    _speaking = false;

    constructor(path: string) {
        this.path = path;
    }

    // 0-100 1-300 0-300
    // SofTalkは読み上げ終了を検知出来ない
    speak(text: string, vParam: VoiceParameter) {
        var args = "";
        if (vParam.use) args += " /V:" + vParam.adjustVolume(0, 100);
        if (vParam.use) args += " /S:" + vParam.adjustRate(1, 300);
        if (vParam.use) args += " /O:" + vParam.adjustPitch(0, 300);
        args += " /W:" + text.replace(/\n/gi, "  ");

        // console.log(this.path +" " +args);
        this._speaking = true;
        cp.spawn(this.path, [args]).on("exit", (code) => {
            Logger.log("result", code);
        }).on("error", (err) => {
            Logger.log("result", err.name);
            process.exit(1);
        });
    }

    cancel() {
        var args = " /stop_now";
        cp.exec(this.path + args, (e, s) => {
            this._speaking = false;
            console.log(s);
        });
    }

    speaking() {
        return this._speaking;
    }
}

export default SofTalk;

import * as cp from "child_process";
import * as os from "os";
import Logger from "./Logger";
import { VoiceParameter } from "./Voice"
import { Speaker } from "./Speaker"
import * as  iconv from "iconv-lite";
const defaultParameter = {
    volume: 50,
    rate: 100,
    pitch: 100
}
class Bouyomi implements Speaker {
    path: string = "";

    constructor(path: string) {
        this.path = path;
    }

    speak(text: string, vParam: VoiceParameter) {
        var args = "";
        args += " /Talk " + "\"" + text.replace(/\n/gi, "  ") + "\"";
        if (vParam.use) args += " " + vParam.adjustRate(50, 300);
        if (vParam.use) args += " " + vParam.adjustPitch(50, 200);
        if (vParam.use) args += " " + vParam.adjustVolume(0, 100);
        //voice-type
        if (vParam.use) args += " 0";

        console.log(this.path + " " + args);
        const buffer = cp.execSync(this.path + args);
        const s = iconv.decode(buffer, "CP932");
        Logger.log("result", s);
    }

    cancel() {
        var args = " /C"; // 全タスクをキャンセル
        cp.execSync(this.path + args);
        args = " /S"; // 現在の行をスキップ
        cp.execSync(this.path + args);
    }
    speaking() {
        let buffer: Buffer;
        try {
            buffer = cp.execSync(this.path + " /GetNowPlaying");
        } catch (e) {
            // 音声再生中は終了コードが１になるのでコマンドの実行に失敗したかのようになる。
            return true;
        }        
        const s = iconv.decode(buffer, "CP932");
        if (s.search("無音状態中") != -1) {
            return false;
        } else {
            // なにかおかしい。
            console.error(s);
            return false;
        }
    }
}

export default Bouyomi;

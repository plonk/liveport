import SofTalk from "./SofTalk"
import WebSpeechApi from "./WebSpeechApi"
import Tamiyasu from "./Tamiyasu"
import Bouyomi from "./Bouyomi"
import { VOICE, VoiceParameter } from "./Voice"
import * as io from "socket.io-client";
import StringUtil from "./StringUtil";
import Logger from "./Logger";
import { Speaker } from "./Speaker"
import { configure } from "./Configure"
import VoiceTextApi from "./VoiceTextApi"
const SystemDictionary = configure.SystemDictionary;
const MODE = {
    AA: "aa",
    MESSAGE: "message"
}
export default class ProvideManager {
    speaking: boolean = false;
    speaker: Speaker;
    vParam: VoiceParameter = new VoiceParameter();
    voice: number = VOICE.WSA;
    reading: boolean = true;
    socket: SocketIOClient.Socket;
    port: number = 3000;
    vtApiKey: string = "";

    constructor() { }

    connectIOServer(port: number = this.port) {
        console.log("connect server")
        this.port = port;
        this.socket = io.connect("http://localhost:" + this.port, { 'forceNew': true });
        this.socket.emit("hello");
    }
    disconnectIOClient() { }
    emit(event: string, value: string) {
        if (this.socket)
            this.socket.emit(event, value);
    }

    provide(letter: string, body: string, reading: boolean = true, timeLimit?: number) {
        if (this.containsNg(body)) {
            const ng = () => {
                if (reading) {
                    this.speak(letter + "\n" + configure.SystemDictionary.NG.reading, timeLimit);
                }
                this.emit(MODE.MESSAGE, letter + "\r\n" + configure.SystemDictionary.NG.reading);
            }
            if (this.speaker.speaking()) {
                this.cancel(ng);
                Logger.log("cancel", "too long text.");
            } else {
                ng();
            }
            return;
        }
        let anchorReplace = StringUtil.anchorToPlain(body);
        let brReplace = StringUtil.replaceBr2NewLine(anchorReplace);
        const aa = () => {
            if (reading)
                this.speak(letter + "\n" + SystemDictionary.AA.reading, timeLimit);
            this.emit(MODE.AA, letter + "\r\n" + brReplace);
        }

        if (this.isAA(brReplace, configure.textLineLimit)) {
            if (this.speaker.speaking()) {
                this.cancel(aa);
                Logger.log("cancel", "too long text.");
            } else {
                aa();
            }
            return;
        }

        const messenger = () => {
            if (reading) {
                let anchorReplace = StringUtil.anchorToReadable(body);
                let brReplace = StringUtil.replaceBr2NewLine(anchorReplace);
                let urlReplace = StringUtil.urlToReadable(brReplace);
                let userDictionary = StringUtil.applyUserDictionary(urlReplace);
                let ZENHANReplace = StringUtil.replaceHANKAKUtoZENKAKU(userDictionary);
                this.speak(letter + "\n" + ZENHANReplace, timeLimit);
            }
            this.emit(MODE.MESSAGE, letter + "\r\n" + brReplace);
        }
        if (this.speaker.speaking()) {
            this.cancel(messenger);
            Logger.log("cancel", "too long text.");
        } else {
            messenger();
        }
    }
    speak(body: string, timeLimit?: number) {
        let text = body;
        if (this.voice === VOICE.TAMIYASU) {
            text = Tamiyasu.calcStringSize(body, timeLimit);
        }
        this.speaker.speak(text, this.vParam);
    }
    containsNg(text: string): boolean {
        return StringUtil.containsNg(text);
    }

    dummyText(body: string) {
        this.emit(MODE.AA, body);
    }

    isAA(value: string, count?: number): boolean {
        return StringUtil.isAA(value, count);
    }

    selectVoice(path?: string) {
        Logger.log("select speaker", VOICE[this.voice.toString()]);
        if (this.voice === VOICE.WSA) {
            this.speaker = new WebSpeechApi();
        } else if (this.voice === VOICE.SOFTALK) {
            this.speaker = new SofTalk(path);
        } else if (this.voice === VOICE.TAMIYASU) {
            this.speaker = new Tamiyasu(path);
        } else if (this.voice === VOICE.BOUYOMI) {
            this.speaker = new Bouyomi(path);
        } else if (this.voice === VOICE.VOICETEXT) {
            this.speaker = new VoiceTextApi(this.vtApiKey);
        }
    }

    cancel(callback?: () => void) {
        this.speaker.cancel();
        setTimeout(() => {
            if (callback) callback();
        }, 1000);
    }
}

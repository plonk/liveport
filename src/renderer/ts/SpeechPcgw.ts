import { VoiceParameter } from "./Voice"
import { Speaker } from "./Speaker"
import * as dataurl from "dataurl";
import * as rp from "request-promise";

class SpeechPcgw implements Speaker {
    audio = new Audio();

    constructor() {
    }

    speak(text: string, vParam: VoiceParameter, callback?: () => any) {
        var encoded = encodeURIComponent(text);
        var options = {
            url: `https://speech.pcgw.pgw.jp/v1/tts`,
            //auth: '',
            encoding: null,
            timeout: 15000,
            form: "text=" + text + "&format=mp3",
        };
        rp.post(options).then(data => {
            const durl = dataurl.convert({ data, mimetype: 'audio/mp3' });
            this.audio.src = durl;
            this.audio.play();
        }).catch(err => {
            console.log("SpeechPcgw error", err);
        });
    }

    cancel() {
        console.log("cancel");
        this.audio.pause();
    }
    
    speaking() {
        return !this.audio.paused;
    }

}

export default SpeechPcgw;
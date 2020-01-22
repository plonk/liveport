import { VoiceParameter } from "./Voice"
import { Speaker } from "./Speaker"
import * as dataurl from "dataurl";
import * as rp from "request-promise";

class VoiceTextApi implements Speaker {
    audio = new Audio();
    key = "";

    constructor(vtApiKey: string) {
        this.key = vtApiKey;
    }

    speak(text: string, vParam: VoiceParameter) {
        var encoded = encodeURIComponent(text);
        var options = {
            url: `https://${this.key}:@api.voicetext.jp/v1/tts`,
            //auth: '',
            encoding: null,
            timeout: 15000,
            form: "speaker=hikari&text=" + text + "&format=mp3",
        };
        rp.post(options).then(data => {
            const durl = dataurl.convert({ data, mimetype: 'audio/mp3' });
            //let audio = new Audio(durl);
            this.audio.src = durl;
            this.audio.play();
        }).catch(err => {
            console.log("VoiceText error", err);
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

export default VoiceTextApi;
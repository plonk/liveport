import { VoiceParameter } from "./Voice"
import { Speaker } from "./Speaker"
import * as dataurl from "dataurl";
import * as rp from "request-promise";

class VoiceTextApi implements Speaker {
    audio = new Audio();
    key = "";
    _speaking = false;

    constructor(vtApiKey: string) {
        this.key = vtApiKey;
    }

    speak(text: string, vParam: VoiceParameter) {
        if (this._speaking) {
            this.cancel();
        }
        this._speaking = true;
        
        var options = {
            url: `https://${this.key}:@api.voicetext.jp/v1/tts`,
            //auth: '',
            encoding: null,
            timeout: 15000,
            form: "speaker=hikari&text=" + encodeURIComponent(text) + "&format=mp3",
        };
        rp.post(options).then(data => {
            const durl = dataurl.convert({ data, mimetype: 'audio/mp3' });
            this.audio.src = durl;
            this.audio.onended = () => { this._speaking = false; };
            this.audio.play();
        }).catch(err => {
            this._speaking = false;
            console.log("VoiceText error", err);
        });
    }

    cancel() {
        console.log("VoiceTextApi: cancel");
        this.audio.pause();
        this._speaking = false;
    }
    
    speaking() {
        return this._speaking;
    }

}

export default VoiceTextApi;
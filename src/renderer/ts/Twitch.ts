"use strict"
import Message from "./Message";
import { DataSource, ThreadList } from "./DataSource";
import * as tmi from "tmi.js";

export class Twitch extends DataSource {
    client: tmi.Client = null;
    queue: Message[] = [];
    channelName: string;

    constructor(url: string) {
        super(url);

        const matches = url.match(/^https?:\/\/(www\.)?twitch\.tv\/(\w+)\/?/);
        this.channelName = matches[2];

        const opts: tmi.Options = {
            channels: [
                this.channelName,
            ],
        };
        this.client = tmi.client(opts);
        this.client.on("message", (target, context, msg, self)=>{
            console.log("tmi message:", target, context, msg, self);

            var res = new Message();
            let num = this.messages.length + this.queue.length + 1;
            let name = context["display-name"];
            let mail = "sage";
            let date = this.formatDate();
            let text = this.escapeHtml(msg).replace(/\r?\n/mg, "<br>");
            let title = "";
            let latest = true;
            let id = "";
            res.setParameters(num, name, mail, date, text, title, id, latest);
            if (context.emotes) {
                // Twitchでレスアンカは無いのでアンカの内部リンク化は省略する。
                res.decorateText = Twitch.embedEmotes(context.emotes, msg);
            }
            this.queue.push(res);
        });
        this.client.on("connected", ()=>{
            console.log("tmi connected");
            this.title = this.channelName;
        });
        this.client.on("disconnected", () => {
            console.log("tmi disconnected");
        });

        this.client.connect();
        this.parentTitle = "Twitch";
    }

    escapeHtml(unsafe: string): string {
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }

    formatDate(date: Date = new Date()): string {
        const Y = date.getFullYear();
        const m = (date.getMonth() + 1).toString().padStart(2,'0');
        const wday = "日月火水木金土".substr(date.getDay(), 1);
        const d = date.getDate().toString().padStart(2,'0');
        const H = date.getHours().toString().padStart(2,'0');
        const M = date.getMinutes().toString().padStart(2,'0');
        const S = date.getSeconds().toString().padStart(2,'0');

        return `${Y}/${m}/${d}(${wday}) ${H}:${M}:${S}`;
    }

    request(success: (number) => void, failed: (err: any) => void) {
        var ret = this.queue.length;
        this.messages.forEach(m => m.latest = false);
        this.messages = this.messages.concat(this.queue);
        this.queue = [];
        this.save();
        success(ret);
    }

    getSetting(success: () => void, failed: (err: any) => void) {
        success();
    }

    sendMessage(message: { MESSAGE: string }, success: (result: string) => void, failed: (err: any) => void) {
        failed("非対応");
    }

    getLists(success: () => void, failed: (err: any) => void) {
        failed("非対応");
    }

    unload() {
        this.client.disconnect();
    }

    static emoteLink(emoteId: string, text: string) {
        console.log("emoteLink", emoteId, text);
        return `<img src="https://static-cdn.jtvnw.net/emoticons/v1/${emoteId}/1.0" title="${text}" />`;
    }

    static embedEmotes(emotes, msg: string): string {
        let rangeToEmote = {};
        for (let emoteId of Object.keys(emotes)) {
            for (let range of emotes[emoteId]) {
                rangeToEmote[range] = emoteId;
            }
        }

        let ranges = Object.keys(rangeToEmote);
        ranges.sort((a, b) => +b.split('-')[0] - +a.split('-')[0]);
        for (let range of ranges) {
            let tmp = range.split('-');
            let beg = +tmp[0], end = +tmp[1] + 1;
            msg = msg.slice(0, beg) + Twitch.emoteLink(rangeToEmote[range], msg.slice(beg, end)) + msg.slice(end);
        }
        return msg;
    }

    static getFormattedUrl(url: string): string {
        let matches = url.match(/^https?:\/\/(www\.)?twitch\.tv\/(\w+)\/?/);
        if (matches.length == 0) {
            return "";
        } else {
            return `https://www.twitch.tv/${matches[2]}/`;
        }
    }

    static isValidThreadUrl(url: string): boolean {
        return /^https?:\/\/(www\.)?twitch\.tv\/(\w+)\/?/.test(url);
    }

    static isValidBbsUrl(url: string): boolean {
        return false;
    }
}
export default Twitch;

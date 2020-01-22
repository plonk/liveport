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

            console.log(target, context);

            var res = new Message();
            let num = this.messages.length + this.queue.length + 1;
            let name = context["display-name"];
            let mail = "sage";
            let date = this.formatDate();
            let text = msg;
            let title = "";
            let latest = true;
            let id = "";
            res.setParameters(num, name, mail, date, text, title, id, latest);
            this.queue.push(res);
        });
        this.client.on("connected", ()=>{
            console.log("tmi connected");

            this.queueSystemMessage(`チャンネル${this.channelName}に接続しました。`);

            this.title = this.channelName;
        });
        this.client.on("disconnected", () => {
            console.log("tmi disconnected");
            this.queueSystemMessage("チャットサーバーとの接続が切断されました。");
        });

        this.client.connect();
        this.parentTitle = "Twitch";
    }

    queueSystemMessage(text: string) {
        var res = new Message();
        let num = this.messages.length + this.queue.length + 1;
        let name = "liveport";
        let mail = "sage";
        let date = this.formatDate();
        let title = "";
        let latest = true;
        let id = "";
        res.setParameters(num, name, mail, date, text, title, id, latest);
        this.queue.push(res);
    }

    formatDate(date: Date = new Date()): string {
        const Y = date.getFullYear();
        const m = date.getMonth() + 1;
        const wday = "日月火水木金土".substr(date.getDay(), 1);
        const d = date.getDate();
        const H = date.getHours();
        const M = date.getMinutes();
        const S = date.getSeconds();

        return `${Y}/${m}/${d}(${wday}) ${H}:${M}:${S}`;
    }

    request(success: (number) => void, failed: (err: any) => void) {
        var ret = this.queue.length;
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

    onUnload() {
        this.client.disconnect();
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

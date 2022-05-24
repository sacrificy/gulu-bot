import { loginDiscord, invite } from "./index.js"

for (let i = 0; i < 3; i++) {
    await loginDiscord(i)
    // await invite(i, 'https://discord.gg/NHwahMsc')
}
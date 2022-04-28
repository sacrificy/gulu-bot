import { loginDiscord, invite } from "./index.js"

for (let i = 0; i < 50; i++) {
    // await loginDiscord(i)
    await invite(i, 'https://discord.gg/De8h5A9t')
}
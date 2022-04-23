import { loginDiscord } from "./index.js"

for (let i = 0; i < twitterList.length; i++) {
    await loginDiscord(i)
}
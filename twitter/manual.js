import { loginTwitter } from "./index.js";

for (let i = 0; i < twitterList.length; i++) {
    await loginTwitter(i)
}
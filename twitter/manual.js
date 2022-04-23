import { loginTwitter } from "./index.js";

for (let i = 0; i < 50; i++) {
    await loginTwitter(i)
}
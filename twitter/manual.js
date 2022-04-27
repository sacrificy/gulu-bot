import axios from "axios";
import faker from "@faker-js/faker";
import fs from "fs";
import { loginTwitter, setProfile } from "./index.js";

const configData = fs.readFileSync(new URL('../config.json', import.meta.url))
const config = JSON.parse(configData.toString())
const {
    picDir,
} = config

for (let i = 0; i < 50; i++) {
    // await loginTwitter(i)
    await setProfile(i)
}
// await setProfile(33)


function getBannerPic(i) {
    return axios({
        method: 'get',
        url: faker.image.animals(600, 220, true),
        responseType: 'stream'
    }).then((response) => {
        response.data.pipe(fs.createWriteStream(`${picDir}/banner_${i}.jpg`));
    })
}

function getAvatarPic(i) {
    return axios({
        method: 'get',
        url: faker.internet.avatar(),
        responseType: 'stream'
    }).then((response) => {
        response.data.pipe(fs.createWriteStream(`${picDir}/avatar_${i}.jpg`));
    })
}

function savePic() {
    if (!fs.existsSync(picDir)) {
        fs.mkdirSync(picDir)
    }
    let picPromisesList = []
    for (let i = 0; i < 50; i++) {
        picPromisesList.push(getBannerPic(i))
        // picPromisesList.push(getAvatarPic(i))
    }
    Promise.all(picPromisesList).then(() => {
        console.log('下载完成')
    })
}

// savePic()


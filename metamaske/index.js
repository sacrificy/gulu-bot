import dappeteer from '@chainsafe/dappeteer'
import puppeteer from 'puppeteer-extra'
import fs from 'fs'

const configData = fs.readFileSync(new URL('../config.json', import.meta.url))
const config = JSON.parse(configData.toString())
const {
    appName,
    seed,
    metaPassword,
    metamaskDir,
    metamaskVersion
} = config
const addressData = fs.readFileSync(new URL(`../account/${appName}/address.txt`, import.meta.url))
const addressList = addressData.toString().split('\r\n')

async function launchChrome(i) {
    const browser = await dappeteer.launch(puppeteer, {
        metamaskVersion: metamaskVersion,
        metamaskLocation: metamaskDir,
        headless: false,
        executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
        userDataDir: `C:/account/${i}`,
    });

    const page = await browser.newPage();
    return [browser, page]
}


async function setMetamask(i) {
    const addressItem = addressList[i]
    // 格式化账密信息
    let [
        address,
        privateKey
    ] = addressItem.split('----');
    const [browser, page] = await launchChrome(i)
    const metamask = await dappeteer.setupMetamask(browser, {
        seed: seed,
        password: metaPassword,
    })
    await metamask.importPK(privateKey)
    await page.waitForTimeout(2000)

    await browser.close()
}

for (let i = 9; i < addressList.length; i++) {
    console.log(i)
    await setMetamask(i)
}
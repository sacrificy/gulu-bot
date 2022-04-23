import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha'
import dappeteer from '@chainsafe/dappeteer'
import fs from 'fs'

const configData = fs.readFileSync(new URL('../config.json', import.meta.url))
const config = JSON.parse(configData.toString())
const {
    appName,
    captchaToken,
    metaPassword,
    metamaskDir,
    metamaskVersion
} = config
const addressData = fs.readFileSync(new URL(`../account/${appName}/address.txt`, import.meta.url))
const addressList = addressData.toString().split('\r\n')

puppeteer.use(StealthPlugin());
puppeteer.use(
    RecaptchaPlugin({
        provider: {
            id: '2captcha',
            token: captchaToken,
        },
        visualFeedback: true, // colorize reCAPTCHAs (violet = detected, green = solved)
    })
);

async function launchChrome(i) {
    const browser = await puppeteer.launch({
        headless: false,
        executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
        userDataDir: `C:/account/${i}`,
        args: [
            `--disable-extensions-except=${metamaskDir}/${metamaskVersion.replaceAll('.','_')}`,
            `--load-extension=${metamaskDir}/${metamaskVersion.replaceAll('.','_')}`
        ]
    });

    const page = await browser.newPage();
    return [browser, page]
}

async function setAddress(i) {

    const [browser, page] = await launchChrome(i)

    browser.on('targetcreated', async (target) => {
        if (target.url().match('chrome-extension://[a-z]+/home.html')) {
            try {
                const metamask = await dappeteer.getMetamaskWindow(browser, 'v10.8.1');
                await metamask.page.evaluate(() =>
                    window.signedIn = false
                );
                await metamask.unlock(metaPassword)

                await page.waitForTimeout(1000)
                await page.goto('https://www.premint.xyz/login')
                await page.bringToFront()
                await page.waitForSelector('button.btn-circle')
                await page.click('button.btn-circle')
                await page.waitForSelector('img[alt="MetaMask"]')
                await page.click('img[alt="MetaMask"]')
            } catch (e) {
                console.log(e)
            }
        }
        if (target.url().match('chrome-extension://[a-z]+/notification.html')) {
            try {
                console.log(target.type())
                const page = await target.page();
                const button = await page.waitForSelector('button.button.btn-primary');
                await button.click();

                const connectButton = await page.waitForSelector('button.button.btn-primary');
                await connectButton.click();

                const button2 = await Promise.race([
                    page.waitForSelector('.request-signature__footer__sign-button'),
                    page.waitForSelector('.signature-request-footer button:last-child'),
                ]);
                await button2.click();
            } catch {
                return;
            }
        }
    });

}

for (let i = 5; i < 6; i++) {
    await setAddress(i)
}
// https://www.premint.xyz/profile/
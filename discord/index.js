import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha'
import fs from 'fs'
import axios from 'axios'
import { TOTP } from '../util/index.js'

const configData = fs.readFileSync(new URL('../config.json', import.meta.url))
const config = JSON.parse(configData.toString())
const {
    appName,
    captchaToken
} = config
const discordData = fs.readFileSync(new URL(`../account/${appName}/discord.txt`, import.meta.url))
const discordList = discordData.toString().split('\r\n')

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
    });
    const page = await browser.newPage();
    return [browser, page]
}

export const loginDiscord = async (i) => {
    const accountItem = discordList[i]
    // 格式化账密信息
    let [
        username,
        mailPassword,
        // mailToken,
        password,
        googleSecret,
        discordToken,
    ] = accountItem.split('----');
    discordToken = discordToken.replaceAll('"', '');
    console.log(i, username, 'start')
    const [browser, page] = await launchChrome(i)
    try {
        await page.goto('https://discord.com/login');
        await page.waitForTimeout(1000);
        // token登录
        await page.evaluate((discordToken) => {
            window.t = discordToken;
            window.localStorage = document.body.appendChild(
                document.createElement`iframe`
            ).contentWindow.localStorage;
            window.setInterval(() => (window.localStorage.token = `"${window.t}"`));
            window.location.reload();
        }, discordToken);
        await page.waitForNavigation();
        await page.waitForNavigation();
        await page.waitForNavigation();
        // 账密登录
        if (page.url() === 'https://discord.com/login') {
            const format = googleSecret.replace(/\s/g, '');
            const totpGenerator = new TOTP(format, 30);
            await page.waitForSelector('input[name="email"]', { visible: true })
            await page.type('input[name="email"]', username);
            await page.type('input[name="password"]', password);
            await page.click('button[type="submit"]');
            await page.waitForTimeout(1000);
            // await page.solveRecaptchas();
            await page.waitForSelector(
                'input[placeholder="6-digit authentication code/8-digit backup code"]',
                { timeout: 0 }
            );
            await page.type(
                'input[placeholder="6-digit authentication code/8-digit backup code"]',
                totpGenerator.getToken()
            );
            await Promise.all([
                await page.keyboard.press('Enter'),
                page.waitForNavigation(),
            ]);
        }
        await page.waitForTimeout(1000)
        console.log(i, username, 'success')
    } catch (error) {
        console.log(i, username, 'fail')
        console.log(error)
        fs.appendFileSync('failLogin.txt', accountItem + '\r\n')
    }
    await browser.close()
};

export const open = async (i) => {
    console.log(i, 'start')
    const [browser, page] = await launchChrome(i)
    try {
        await page.goto('https://discord.com/channels/@me')
        console.log(i, 'success')
    } catch (error) {
        console.log(i, 'fail')
        console.log(error)
    }
    // await browser.close()
};

export async function invite(i, inviteLink) {
    console.log(i, 'start')
    const [browser, page] = await launchChrome(i)
    try {
        await page.goto(inviteLink);
        await page.waitForTimeout(1000)
        await page.waitForSelector('section button', { visible: true })
        await page.click('section button')
        const response = await page.waitForResponse((response) => {
            return response.url().startsWith("https://discord.com/api/v9/invites")
        });
        if (response.status() === 200) {
            await page.waitForTimeout(2000)
            // await browser.close()
            // await page.solveRecaptchas();
        }
        console.log(i, "end")
    } catch (error) {
        console.log(error)
    }
}

export async function discord(index, actionList = []) {
    const [browser, page] = await launchChrome(index)
    let result = { success: `${index}成功`, text: '' }
    try {
        for (let i = 0; i < actionList.length; i++) {
            const actionItem = actionList[i]
            const { action, value } = actionItem
            switch (action) {
                case 'like':
                    await like(page)
                    break;
                case 'retweet':
                    await retweet(page)
                    break;
                case 'tweet':
                    await tweet(page, value)
                    break;
                case 'follow':
                    await follow(page, value)
                    break;
                case 'goto':
                    await goto(page, value)
                    break;
                default:
                    break;
            }
        }
    } catch (error) {
        result = { success: `${index}成功`, text: error }
    }
    await browser.close()
    return result
}
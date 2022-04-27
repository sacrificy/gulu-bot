import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha'
import fs from 'fs'
import axios from 'axios'
import faker from '@faker-js/faker'

const configData = fs.readFileSync(new URL('../config.json', import.meta.url))
const config = JSON.parse(configData.toString())
const {
    appName,
    captchaToken,
    picDir
} = config
const twitterData = fs.readFileSync(new URL(`../account/${appName}/twitter.txt`, import.meta.url))
const twitterList = twitterData.toString().split('\r\n')

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

async function like(page) {
    await page.waitForSelector('div[data-testid="like"]', { visible: true })
    await page.click('div[data-testid="like"]')
    await page.waitForTimeout(1000)
}

async function retweet(page) {
    await page.waitForSelector('div[data-testid="retweet"]', { visible: true })
    await page.click('div[data-testid="retweet"]')
    await page.waitForSelector('div[data-testid="retweetConfirm"]', { visible: true })
    await page.click('div[data-testid="retweetConfirm"]')
    await page.waitForTimeout(1000)
}

async function tweet(page, content) {
    await page.waitForSelector('div[data-testid="tweetTextarea_0"]', { visible: true })
    await page.type('div[data-testid="tweetTextarea_0"]', content + ' ')
    await page.waitForTimeout(1000)
    await page.click('div[data-testid="tweetButtonInline"]')
    await page.waitForTimeout(3000)
}

async function follow(page, id) {
    await page.goto(`https://twitter.com/${id}`)
    await page.waitForSelector('div[data-testid*="follow"]', { visible: true })
    await page.keyboard.press('Escape') // special case
    await page.click('div[data-testid*="follow"]')
    await page.waitForTimeout(1000)
}

async function goto(page, link) {
    await page.goto(link)
}


export const communi = async (i) => {
    const accountItem = twitterList[i]
    // 格式化账密信息
    let [
        username,
        password,
        mail,
        phone
    ] = accountItem.split(':');
    console.log(i, 'start')
    const [browser, page] = await launchChrome(i)
    try {
        await page.goto('http://oelinks.co/communi3')
        const discord = await page.waitForSelector('a')
        await discord.click()
        const authorize = await page.waitForSelector('#app-mount > div.app-3xd6d0 > div > div.leftSplit-hm3715.nonEmbeddedLeftSplit-1DjcEq > div > div > div > div.footer-3Gu_Tl > button.button-f2h6uQ.lookFilled-yCfaCM.colorBrand-I6CyqQ.sizeMedium-2bFIHr.grow-2sR_-F', { visible: true })
        await authorize.click()
        await page.waitForNavigation()
        const join = await page.waitForSelector('button')
        await join.click()
        await page.waitForNavigation()
        await page.waitForTimeout(3000)
        await page.waitForSelector('#quest-container > div.page-container.scroller > div.goals.scroller.flex.row.wrap > imp-quest-container:nth-child(1) > section > section.quest-goal > div.actions > button', { visible: true })
        let buttonList = await page.$$('button')
        const twitter1 = buttonList[9]
        await twitter1.click()
        const input = await page.waitForSelector('textarea')
        await input.type(username)
        await page.waitForTimeout(1000)
        await page.click('#mat-dialog-0 > imp-quest-container-action-modal > div > div.quest-actions > div > button.mat-flat-button.mat-button-base.mat-primary.ng-star-inserted')
        await page.waitForTimeout(3000)

        const buttonList2 = await page.$$('button')
        const twitter2 = buttonList2[10]
        await twitter2.click()
        await page.waitForTimeout(2000)
        await page.bringToFront()
        await page.waitForTimeout(2000)
        const buttonList3 = await page.$$('button')
        const twitter3 = buttonList3[11]
        await twitter3.click()
        await page.waitForTimeout(2000)
        await page.bringToFront()
        await page.waitForTimeout(2000)

        await page.waitForSelector('#quest-container > div.page-header.ng-star-inserted > div > button:nth-child(2)')
        await page.click('#quest-container > div.page-header.ng-star-inserted > div > button:nth-child(2)')

        const raffel = await page.waitForSelector('#store-container > div > div.scroller > div > div.items.flex.row.wrap.ng-star-inserted > imp-store-item > section > div.flex.row.nowrap.margin-top--12 > button')
        await raffel.click()
        const num = await page.waitForSelector('#mat-input-2')
        await num.type('1')
        await page.waitForTimeout(1000)
        const end = await page.waitForSelector('#mat-dialog-1 > imp-store-raffle-item-purchase-modal > div > div.actions.flex.row.nowrap.align-center.margin-top--16 > button.fill.mat-flat-button.mat-button-base.mat-primary')
        await end.click()
        await page.waitForTimeout(4000)
        console.log(i, 'success')

    } catch (error) {
        console.log(i, 'fail')
        console.log(error)
    }
    await browser.close()
};

for (let i = 0; i < 50; i++) {
    await communi(i)
}
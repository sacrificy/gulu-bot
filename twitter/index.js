import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha'
import fs from 'fs'
import axios from 'axios';

const configData = fs.readFileSync('../config.json')
const config = JSON.parse(configData.toString())
const {
  appName,
  captchaToken
} = config
const twitterData = fs.readFileSync(`../account/${appName}/twitter.txt`)
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

async function getPage(i) {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    userDataDir: `C:/account/${i}`,
  });
  const page = await browser.newPage();
  return page
}

function getFrends(num) {
  let str = ''
  for (let i = 0; i < num; i++) {
    const index = parseInt(Math.random() * (twitterList.length), 10)
    console.log(index)
    const name = twitterList[index].split(':')[0]
    str = str + ` @${name}`
  }
  return str
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

export const loginTwitter = async (i) => {
  const accountItem = twitterList[i]
  // 格式化账密信息
  let [
    username,
    password,
    mail,
    phone
  ] = accountItem.split(':');
  console.log(i, username, 'start')
  const page = await getPage(i)
  try {
    await page.goto('https://twitter.com/i/flow/login')
    await page.waitForSelector('input[autocomplete="username"]', { visible: true })
    await page.type('input[autocomplete="username"]', username)
    await page.keyboard.press('Enter')
    await page.waitForSelector('input[autocomplete="current-password"]', { visible: true })
    await page.type('input[autocomplete="current-password"]', password)
    await page.keyboard.press('Enter')
    await page.waitForSelector('input[autocomplete="tel"]', { visible: true })
    await page.type('input[autocomplete="tel"]', phone)
    await Promise.all([
      await page.keyboard.press('Enter'),
      page.waitForNavigation(),
    ]);
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
  const page = await getPage(i)
  try {
    await page.goto('https://twitter.com/home')
    console.log(i, 'success')
  } catch (error) {
    console.log(i, 'fail')
    console.log(error)
  }
  // await browser.close()
};

export const randomTweet = async (i) => {
  console.log(i, 'start')
  const response = await axios.get('https://api.adviceslip.com/advice')
  const advice = response?.data?.slip?.advice
  if (!advice) return
  const page = await getPage(i)
  try {
    await page.goto('https://twitter.com/home')
    await tweet(page, advice)
    console.log(i, advice, 'success')
  } catch (error) {
    console.log(i, advice, 'fail')
    console.log(error)
  }
  await browser.close()
};

export const randomRetweet = async (i) => {
  console.log(i, 'start')
  const page = await getPage(i)
  try {
    await page.goto('https://twitter.com/home')
    await retweet(page)
    console.log(i, 'success')
  } catch (error) {
    console.log(i, 'fail')
    console.log(error)
  }
  // await browser.close()
};

export const prize = async (i) => {
  console.log(i, 'start')
  const discordName = discordList[i].split('----')[0];
  const friends = getFrends(5)
  console.log(i, friends)
  const page = await getPage(i)
  try {
    await follow(page, 'MindblowonNFT')
    await follow(page, 'WSecretClub_nft')
    await follow(page, 'ethoverfiat')

    await page.goto('https://twitter.com/WSecretClub_nft/status/1513895758327848967')

    await like(page)
    await retweet(page)
    await tweet(page, friends)

    console.log(i, 'success')
  } catch (error) {
    console.log(i, 'fail')
    console.log(error)
  }
  await browser.close()
};

for (let i = 0; i < twitterList.length; i++) {
  await loginTwitter(i)
  // await randomTweet(i)
  // await randomRetweet(i)
  // await prize(i)
}
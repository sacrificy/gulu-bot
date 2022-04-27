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

async function goto(page, link) {
  await page.goto(link)
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
  const [browser, page] = await launchChrome(i)
  try {
    await page.goto('https://twitter.com/i/flow/login')
    await page.waitForSelector('input[autocomplete="username"]', { visible: true })
    await page.type('input[autocomplete="username"]', username)
    await page.keyboard.press('Enter')
    await page.waitForSelector('input[autocomplete="current-password"]', { visible: true })
    await page.type('input[autocomplete="current-password"]', password)
    // await page.keyboard.press('Enter')
    // await page.waitForSelector('input[autocomplete="tel"]', { visible: true })
    // await page.type('input[autocomplete="tel"]', phone)
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

export const setProfile = async (i) => {
  console.log(i, 'start')
  const [browser, page] = await launchChrome(i)
  await page.goto('https://twitter.com/home')
  await page.waitForTimeout(2000)
  if (page.url().includes('access')) {
    console.log(i, 'block')
    fs.appendFileSync('block.txt', i + '\r\n')
    await browser.close()
    return
  }
  const profileLink = await page.waitForSelector('a[data-testid="AppTabBar_Profile_Link"]')
  await profileLink.click()
  const editProfileButton = await page.waitForSelector('a[data-testid="editProfileButton"]')
  await editProfileButton.click()
  await page.waitForTimeout(1000)
  if (page.url() === 'https://twitter.com/i/flow/setup_profile') {
    const inputAcatar = await page.waitForSelector('input[data-testid="fileInput"]')
    await inputAcatar.uploadFile(`${picDir}/avatar_${i}.jpg`)
    const applyButton = await page.waitForSelector('div[data-testid="applyButton"]')
    await applyButton.click()
    const nextButton = await page.waitForSelector('div[data-testid="ocfSelectAvatarNextButton"]')
    await nextButton.click()
    const inputBanner = await page.waitForSelector('input[data-testid="fileInput"]')
    await inputBanner.uploadFile(`${picDir}/banner_${i}.jpg`)
    const applyButton2 = await page.waitForSelector('div[data-testid="applyButton"]')
    await applyButton2.click()
    const nextButton2 = await page.waitForSelector('div[data-testid="ocfSelectBannerNextButton"]')
    await nextButton2.click()
    const bio = await page.waitForSelector('textarea[data-testid="ocfEnterTextTextInput"]')
    await bio.type(faker.company.companyName())
    const nextButton3 = await page.waitForSelector('div[data-testid="ocfEnterTextNextButton"]')
    await nextButton3.click()
    await page.waitForTimeout(2000)
    await browser.close()
    console.log(i, 'end')
  }
  if (page.url() === 'https://twitter.com/settings/profile') {
    const inputBanner = await page.waitForSelector('input[data-testid="fileInput"]')
    await inputBanner.uploadFile(`${picDir}/banner_${i}.jpg`)
    const applyButton = await page.waitForSelector('div[data-testid="applyButton"]')
    await applyButton.click()
    await page.waitForTimeout(1000)
    const bio = await page.waitForSelector('textarea[name="description"]')
    const bioText = faker.company.companyName()
    await bio.type(bioText)
    const save = await page.waitForSelector('div[data-testid="Profile_Save_Button"]')
    await save.click()
    await page.waitForTimeout(2000)
    await browser.close()
    console.log(i, 'end')
  }
}

export const open = async (i) => {
  console.log(i, 'start')
  const [browser, page] = await launchChrome(i)
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
  const [browser, page] = await launchChrome(i)
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
  const [browser, page] = await launchChrome(i)
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

export async function twitter(index, actionList = []) {
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
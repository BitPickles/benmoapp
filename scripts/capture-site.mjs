import puppeteer from 'puppeteer'

const [, , url, output] = process.argv

if (!url || !output) {
  throw new Error('Usage: node scripts/capture-site.mjs <url> <output>')
}

const browser = await puppeteer.launch({ headless: true })
const page = await browser.newPage()

await page.setViewport({ width: 1440, height: 1600, deviceScaleFactor: 1 })
await page.goto(url, { waitUntil: 'networkidle2', timeout: 120000 })
await page.screenshot({ path: output, fullPage: true })

await browser.close()

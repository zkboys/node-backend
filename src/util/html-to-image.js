const puppeteer = require('puppeteer');

function delay(times) {
    return new Promise(resolve => setTimeout(resolve, times));
}

async function htmlToImage(options) {
    const {
        url, // 网页地址
        width = 320,
        height = 100,
        isMobile = true,
        deviceScaleFactor = 2,
        isLandscape = true,
        timeout = 1000 * 10,

        type = 'png',
        path,  // 不提供，不保存到本地
        fullPage = true,
        quality,
        encoding = 'base64',
    } = options;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, {
        timeout,
        waitUntil: ['load', 'domcontentloaded', 'networkidle0', 'networkidle2'],
    });
    await page.setViewport({
        width,
        height,
        isMobile,
        deviceScaleFactor,
        isLandscape,
    });
    await delay(1000);
    const base64 = await page.screenshot({
        type,
        path,
        fullPage,
        quality,
        encoding,
    });

    browser.close();

    return `data:image/${type};base64,${base64}`;
}

//
//
// htmlToImage({
//     url: 'http://localhost:7300/reports?ids=1',
//     path: './example.png',
// }).then(res => {
//     console.log(res);
// });


module.exports = htmlToImage;

const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({
        executablePath: '/nix/store/lpdrfl6n16q5zdf8acp4bni7yczzcx3h-idx-builtins/bin/chromium',
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    const filePath = 'file://' + path.resolve(__dirname, 'presentation.html');
    await page.goto(filePath, { waitUntil: 'networkidle0' });

    // Get total number of slides
    const totalSlides = await page.evaluate(() => document.querySelectorAll('.slide').length);

    // Show all slides stacked for PDF printing
    await page.evaluate((total) => {
        // Hide nav
        document.querySelector('.nav-bar').style.display = 'none';
        // Show all slides
        const slides = document.querySelectorAll('.slide');
        slides.forEach(s => {
            s.style.display = 'flex';
            s.style.flexDirection = 'column';
            s.style.justifyContent = 'center';
            s.style.minHeight = '100vh';
            s.style.pageBreakAfter = 'always';
            s.style.marginBottom = '0';
            s.style.borderRadius = '0';
        });
        // Remove wrapper padding
        document.querySelector('.slides-wrapper').style.padding = '0';
        document.querySelector('.slides-wrapper').style.width = '100%';
        document.querySelector('.slides-wrapper').style.margin = '0';
        document.body.style.background = '#fff';
    }, totalSlides);

    await page.pdf({
        path: path.resolve(__dirname, 'presentation.pdf'),
        format: 'A4',
        landscape: true,
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });

    console.log('PDF saved: presentation.pdf');
    await browser.close();
})();

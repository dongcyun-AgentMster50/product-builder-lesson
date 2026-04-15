#!/usr/bin/env node
// Demo script HTML → PDF export via puppeteer-core (uses installed Chrome).
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_CANDIDATES = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
];

const fs = require('fs');
function findBrowser() {
    for (const p of CHROME_CANDIDATES) if (fs.existsSync(p)) return p;
    throw new Error('No Chrome/Edge found at standard Windows paths.');
}

(async () => {
    const htmlPath = path.resolve('slides', 'demo-script-executive.html');
    const outPath = path.resolve('slides', 'demo-script-executive.pdf');
    const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');

    const executablePath = findBrowser();
    console.log('Browser:', executablePath);
    console.log('Source :', htmlPath);
    console.log('Output :', outPath);

    const browser = await puppeteer.launch({
        executablePath,
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    try {
        const page = await browser.newPage();
        await page.goto(fileUrl, { waitUntil: 'networkidle0' });
        await page.pdf({
            path: outPath,
            format: 'A4',
            printBackground: true,
            margin: { top: '12mm', right: '12mm', bottom: '14mm', left: '12mm' },
            preferCSSPageSize: false,
            displayHeaderFooter: true,
            headerTemplate: '<span></span>',
            footerTemplate: '<div style="width:100%;text-align:center;font-size:9px;color:#888;padding:0 20px"><span>Scenario Self Generation Agent — Executive 5min Demo Script</span> &middot; <span class="pageNumber"></span>/<span class="totalPages"></span></div>',
        });
        const stat = fs.statSync(outPath);
        console.log(`\nPDF generated: ${outPath} (${(stat.size/1024).toFixed(1)} KB)`);
    } finally {
        await browser.close();
    }
})().catch(err => {
    console.error('PDF export failed:', err.message);
    process.exit(1);
});

// Renders a one-page worksheet PDF via Playwright's Chromium (already an
// installed project dependency for e2e tests), so generating these PDFs
// needs no new npm package. Brand palette matches the rest of the site:
// navy #0F1B2D, gold #C9A227, cream #FAF7F1.

function worksheetHtml({ title, moduleName, intro, prompts, reflection }) {
  const promptItems = prompts
    .map(
      (prompt) =>
        `<div class="prompt"><p class="prompt-label">${prompt}</p><div class="line"></div><div class="line"></div></div>`
    )
    .join('')

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @page { size: A4; margin: 0; }
  body { margin: 0; font-family: Georgia, 'Times New Roman', serif; color: #0F1B2D; background: #FAF7F1; }
  .page { padding: 48px 56px; }
  .eyebrow { font-family: Arial, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #C9A227; }
  h1 { font-size: 26px; margin: 10px 0 4px; line-height: 1.2; }
  .module { font-family: Arial, sans-serif; font-size: 13px; color: #4B5768; margin-bottom: 18px; }
  .rule { height: 2px; background: #C9A227; width: 64px; margin: 18px 0 20px; }
  .intro { font-size: 13.5px; line-height: 1.6; color: #2A3444; margin-bottom: 22px; }
  .prompt { margin-bottom: 20px; }
  .prompt-label { font-family: Arial, sans-serif; font-size: 12.5px; font-weight: 700; color: #0F1B2D; margin: 0 0 10px; }
  .line { border-bottom: 1px solid #C9A227; height: 24px; }
  .reflection { margin-top: 10px; padding: 16px 18px; background: #FFFFFF; border-left: 3px solid #C9A227; }
  .reflection-label { font-family: Arial, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #C9A227; margin: 0 0 6px; }
  .reflection p { margin: 0; font-size: 13.5px; line-height: 1.6; font-style: italic; }
  .footer { position: absolute; bottom: 36px; left: 56px; right: 56px; font-family: Arial, sans-serif; font-size: 9.5px; color: #8A93A3; display: flex; justify-content: space-between; }
</style>
</head>
<body>
  <div class="page">
    <p class="eyebrow">Parental Guidance &middot; Salim Cyrus / Halisi Hub Connect</p>
    <h1>${title}</h1>
    <p class="module">${moduleName}</p>
    <div class="rule"></div>
    <p class="intro">${intro}</p>
    ${promptItems}
    <div class="reflection">
      <p class="reflection-label">Reflection question</p>
      <p>${reflection}</p>
    </div>
    <div class="prompt" style="margin-top: 26px;">
      <p class="prompt-label">Notes</p>
      <div class="line"></div>
      <div class="line"></div>
      <div class="line"></div>
      <div class="line"></div>
      <div class="line"></div>
    </div>
  </div>
  <div class="footer"><span>www.salimcyrus.com</span><span>Parental Guidance</span></div>
</body>
</html>`
}

async function renderWorksheetPdf({ chromium, title, moduleName, intro, prompts, reflection, outputPath }) {
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage()
    await page.setContent(worksheetHtml({ title, moduleName, intro, prompts, reflection }), { waitUntil: 'load' })
    await page.pdf({ path: outputPath, format: 'A4', printBackground: true })
  } finally {
    await browser.close()
  }
}

module.exports = { renderWorksheetPdf }

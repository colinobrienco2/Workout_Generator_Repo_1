const { chromium } = require('C:/Users/colin/AppData/Local/npm-cache/_npx/8d2e8001be657ecc/node_modules/playwright');
const fs = require('fs');
const path = require('path');
const sampleStatus = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data/examples/sample-weekly-status.json'), 'utf8'));
const pairings = [['chest','back'],['back','triceps'],['chest','biceps'],['chest','triceps'],['back','biceps'],['legs','shoulders'],['legs','biceps'],['biceps','triceps']];
const labelMap = { chest:'Chest', back:'Back', legs:'Legs', shoulders:'Shoulders', biceps:'Biceps', triceps:'Triceps' };
const expectedLabel = (a,b) => labelMap[a] + ' + ' + labelMap[b];
async function selectOption(page, id, label) {
  await page.locator('#' + id).click();
  await page.getByRole('option', { name: label, exact: true }).click();
}
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1600 } });
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', err => pageErrors.push(String(err)));
  await page.addInitScript(() => {
    window.localStorage.setItem('workout_generator_api_url', 'https://script.google.com/macros/s/test/exec');
  });
  await page.route('**/api/weekly-latest?**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(sampleStatus) }));
  const results = [];
  for (const [primary, secondary] of pairings) {
    const pairingLabel = expectedLabel(primary, secondary);
    const result = { pairing: pairingLabel, duplicateSecondaryPrevented: false, labelClean: false, generateWorked: false, titleMatches: false, focusMatches: false, exercises: [], swapWorked: false, absToggleWorked: false, coachWorked: false, errors: [], screenshot: null };
    try {
      await page.goto('http://127.0.0.1:3000', { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForSelector('#primary-muscle', { timeout: 15000 });
      await selectOption(page, 'primary-muscle', labelMap[primary]);
      await selectOption(page, 'secondary-muscle', labelMap[secondary]);
      await page.locator('#secondary-muscle').click();
      result.duplicateSecondaryPrevented = (await page.getByRole('option', { name: labelMap[primary], exact: true }).count()) === 0;
      await page.keyboard.press('Escape');
      const bodyBefore = await page.locator('body').textContent();
      result.labelClean = (bodyBefore || '').includes(pairingLabel);
      await page.getByRole('button', { name: 'Generate Workout' }).click();
      await page.waitForSelector('h4.font-semibold.text-foreground', { timeout: 15000 });
      result.generateWorked = true;
      const bodyAfter = await page.locator('body').textContent();
      result.titleMatches = (bodyAfter || '').includes(pairingLabel + ' —') || (bodyAfter || '').includes(pairingLabel + ' â€”');
      result.focusMatches = (bodyAfter || '').includes(pairingLabel);
      result.exercises = await page.locator('h4.font-semibold.text-foreground').allTextContents();
      const firstSwapButton = page.getByRole('button', { name: /^Swap$/ }).first();
      const firstExerciseBefore = result.exercises[0] || '';
      if (await firstSwapButton.isEnabled({ timeout: 2000 }).catch(() => false)) {
        await firstSwapButton.click();
        await page.waitForTimeout(500);
        const afterSwap = await page.locator('h4.font-semibold.text-foreground').allTextContents();
        result.swapWorked = Boolean(afterSwap[0] && afterSwap[0] !== firstExerciseBefore);
      }
      await page.locator('#include-abs').click();
      await page.getByRole('button', { name: 'Generate Workout' }).click();
      await page.waitForTimeout(500);
      const hasAbsOff = (await page.locator('text=Abs Finisher').count()) === 0;
      await page.locator('#include-abs').click();
      await page.getByRole('button', { name: 'Generate Workout' }).click();
      await page.waitForTimeout(500);
      const hasAbsOn = (await page.locator('text=Abs Finisher').count()) > 0;
      result.absToggleWorked = hasAbsOff && hasAbsOn;
      const firstExerciseCard = page.locator('h4.font-semibold.text-foreground').first();
      const firstExerciseName = await firstExerciseCard.textContent();
      await firstExerciseCard.click();
      const selectedBadgeVisible = (await page.locator('text=Selected for Coach').count()) > 0;
      await page.getByRole('button', { name: 'Exercise Help' }).click({ timeout: 5000 });
      await page.getByRole('button', { name: 'Why is this exercise here?' }).click({ timeout: 5000 });
      await page.waitForTimeout(500);
      const coachBody = await page.locator('body').textContent();
      result.coachWorked = selectedBadgeVisible && Boolean(firstExerciseName && (coachBody || '').includes(firstExerciseName));
      const screenshotPath = path.join(process.cwd(), '.tmp', primary + '-' + secondary + '.png');
      await page.screenshot({ path: screenshotPath, fullPage: true });
      result.screenshot = screenshotPath;
      if (!result.labelClean) result.errors.push('Pairing label did not appear cleanly.');
      if (!result.titleMatches || !result.focusMatches) result.errors.push('Workout title or focus did not match the pair cleanly.');
      if (!result.swapWorked) result.errors.push('Swap did not visibly change the first exercise.');
      if (!result.absToggleWorked) result.errors.push('Abs toggle did not reliably add/remove the abs finisher.');
      if (!result.coachWorked) result.errors.push('Coach selected-exercise flow did not confirm the selected exercise.');
      if (!result.duplicateSecondaryPrevented) result.errors.push('Secondary dropdown still exposed the currently selected primary muscle.');
      console.log('completed', pairingLabel);
    } catch (error) {
      result.errors.push(String(error));
      console.log('failed', pairingLabel, String(error));
    }
    results.push(result);
  }
  fs.writeFileSync(path.join(process.cwd(), '.tmp', 'pairing-verification-report.json'), JSON.stringify({ results, consoleErrors, pageErrors }, null, 2));
  await browser.close();
})();

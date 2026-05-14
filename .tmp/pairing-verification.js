const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const sampleStatus = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'data/examples/sample-weekly-status.json'), 'utf8')
);

const pairings = [
  ['chest', 'back'],
  ['back', 'triceps'],
  ['chest', 'biceps'],
  ['chest', 'triceps'],
  ['back', 'biceps'],
  ['legs', 'shoulders'],
  ['legs', 'biceps'],
  ['biceps', 'triceps'],
];

const labelMap = {
  chest: 'Chest',
  back: 'Back',
  legs: 'Legs',
  shoulders: 'Shoulders',
  biceps: 'Biceps',
  triceps: 'Triceps',
};

function expectedLabel(primary, secondary) {
  return labelMap[primary] + ' + ' + labelMap[secondary];
}

async function selectRadixOption(page, triggerId, optionText) {
  await page.locator('#' + triggerId).click();
  await page.getByRole('option', { name: optionText, exact: true }).click();
}

async function collectExerciseNames(page) {
  return await page.locator('h4.font-semibold.text-foreground').allTextContents();
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1600 } });
  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => {
    pageErrors.push(String(err));
  });

  await page.addInitScript(() => {
    window.localStorage.setItem('workout_generator_api_url', 'https://script.google.com/macros/s/test/exec');
  });

  await page.route('**/api/weekly-latest?**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(sampleStatus),
    });
  });

  await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle' });

  const results = [];

  for (const [primary, secondary] of pairings) {
    const pairingLabel = expectedLabel(primary, secondary);
    const result = {
      pairing: pairingLabel,
      duplicateSecondaryPrevented: false,
      duplicatePrimaryHasOptions: false,
      labelClean: false,
      generateWorked: false,
      titleMatches: false,
      focusMatches: false,
      exercises: [],
      swapWorked: false,
      absToggleWorked: false,
      coachWorked: false,
      errors: [],
      screenshot: null,
    };

    try {
      await page.reload({ waitUntil: 'networkidle' });
      await selectRadixOption(page, 'primary-muscle', labelMap[primary]);
      await selectRadixOption(page, 'secondary-muscle', labelMap[secondary]);

      await page.locator('#secondary-muscle').click();
      result.duplicateSecondaryPrevented = (await page.getByRole('option', { name: labelMap[primary], exact: true }).count()) === 0;
      await page.keyboard.press('Escape');

      await page.locator('#primary-muscle').click();
      result.duplicatePrimaryHasOptions = (await page.getByRole('option', { name: labelMap[secondary], exact: true }).count()) > 0;
      await page.keyboard.press('Escape');

      const bodyBefore = await page.locator('body').textContent();
      result.labelClean = (bodyBefore || '').includes(pairingLabel);

      await page.getByRole('button', { name: 'Generate Workout' }).click();
      await page.waitForSelector('h4.font-semibold.text-foreground', { timeout: 15000 });
      result.generateWorked = true;

      const bodyAfter = await page.locator('body').textContent();
      result.titleMatches = (bodyAfter || '').includes(pairingLabel + ' —') || (bodyAfter || '').includes(pairingLabel + ' â€”');
      result.focusMatches = (bodyAfter || '').includes(pairingLabel);
      result.exercises = await collectExerciseNames(page);

      const firstSwapButton = page.getByRole('button', { name: /^Swap$/ }).first();
      const firstExerciseBefore = result.exercises[0] || '';
      if (await firstSwapButton.isEnabled()) {
        await firstSwapButton.click();
        await page.waitForTimeout(500);
        const exercisesAfterSwap = await collectExerciseNames(page);
        result.swapWorked = Boolean(exercisesAfterSwap[0] && exercisesAfterSwap[0] !== firstExerciseBefore);
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
      await page.getByRole('button', { name: 'Exercise Help' }).click();
      await page.getByRole('button', { name: 'Why is this exercise here?' }).click();
      await page.waitForTimeout(500);
      const coachBody = await page.locator('body').textContent();
      result.coachWorked = selectedBadgeVisible && Boolean(firstExerciseName && (coachBody || '').includes(firstExerciseName));

      const screenshotPath = path.join(process.cwd(), '.tmp', primary + '-' + secondary + '.png');
      await page.screenshot({ path: screenshotPath, fullPage: true });
      result.screenshot = screenshotPath;

      if (!result.labelClean) result.errors.push('Pairing label did not appear cleanly in the page text.');
      if (!result.titleMatches || !result.focusMatches) result.errors.push('Workout title or focus did not clearly match the selected pair.');
      if (!result.swapWorked) result.errors.push('Swap did not visibly change the first exercise.');
      if (!result.absToggleWorked) result.errors.push('Abs toggle did not reliably add/remove the abs finisher.');
      if (!result.coachWorked) result.errors.push('Coach selected-exercise flow did not confirm the selected exercise cleanly.');
      if (!result.duplicateSecondaryPrevented) result.errors.push('Secondary dropdown still exposed the currently selected primary muscle.');
    } catch (error) {
      result.errors.push(String(error));
    }

    results.push(result);
  }

  const report = { results, consoleErrors, pageErrors };
  fs.writeFileSync(path.join(process.cwd(), '.tmp', 'pairing-verification-report.json'), JSON.stringify(report, null, 2));
  await browser.close();
})();

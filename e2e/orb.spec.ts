import { test, expect } from '@playwright/test';

test('orb is drawn on the canvas', async ({ page }) => {
  await page.goto('/');
  const orb = page.getByRole('img', { name: 'Liquid orb' });
  await expect(orb).toBeVisible();

  // The centre of the blob is always inside the outline, so it must be painted.
  const centreAlpha = await orb.evaluate((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')!;
    return ctx.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data[3];
  });
  expect(centreAlpha).toBe(255);
});

test('sliders update the readout', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('slider', { name: 'Lobes' }).fill('7');
  await expect(page.getByTestId('value-lobes')).toHaveText('7');
  await page.getByRole('slider', { name: 'Hue' }).fill('300');
  await expect(page.getByTestId('value-hue')).toHaveText('300');
});

test('a saved preset can be loaded back', async ({ page }) => {
  await page.goto('/');
  const name = `e2e ${Date.now()}`;

  await page.getByRole('slider', { name: 'Lobes' }).fill('7');
  await page.getByLabel('Preset name').fill(name);
  await page.getByRole('button', { name: 'Save preset' }).click();
  await expect(page.getByTestId('status')).toHaveText(`saved "${name}"`);

  await page.getByRole('slider', { name: 'Lobes' }).fill('4');
  await expect(page.getByTestId('value-lobes')).toHaveText('4');

  await page
    .getByRole('listitem')
    .filter({ hasText: name })
    .getByRole('button', { name: 'Load' })
    .click();
  await expect(page.getByTestId('value-lobes')).toHaveText('7');
});

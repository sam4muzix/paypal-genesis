// Requires a migrated local Wrangler server and an installed Playwright runner.
import { test, expect } from '@playwright/test';

const widths = [1440, 1024, 768, 390];
const unique = () => `ux-${Date.now()}-${Math.random().toString(36).slice(2)}@example.test`;

async function signUpAndSignIn(page) {
  const email = unique();
  await page.goto('/');
  await page.getByRole('button', { name: 'Sign In' }).first().click();
  await page.getByRole('link', { name: 'Create an account' }).click();
  await page.getByLabel(/Your name/).fill('UX Tester');
  await page.getByLabel(/Email/).fill(email);
  await page.getByLabel(/Password/).fill('long-test-password-123');
  await page.getByRole('button', { name: 'Create account' }).click();
  await page.getByLabel(/Email/).fill(email);
  await page.getByLabel(/Password/).fill('long-test-password-123');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Home' })).toBeVisible();
}

test('visitor understands Introduction page, Home and permanent Help', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Products should begin with people.')).toBeVisible();
  await expect(page.getByText('Share what you wish existed. Help improve what already exists. See how manufacturers bring better products to life.')).toBeVisible();
  await expect(page.getByText(/YOU IMAGINE.*PEOPLE SUPPORT.*MAKERS BUILD/)).toBeVisible();
  await page.getByRole('button', { name: 'Get Started' }).first().click();
  await expect(page.getByText('What product do you wish existed?')).toBeVisible();
  for (const name of [
    'Request a Product',
    'Explore Ideas',
    'Report a Problem',
    'My Products',
  ]) {
    await expect(page.getByRole('button', { name: new RegExp(name) })).toBeVisible();
  }
  await page.getByRole('button', { name: 'Help', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'How GENESIS works' })).toBeVisible();
});

test('consumer completes request wizard, supports idea and reports issue', async ({ page }) => {
  await signUpAndSignIn(page);
  await page.getByRole('button', { name: /Request a Product/ }).click();
  await page.getByLabel(/Describe your idea/).fill('A portable eight input recording interface for small venues.');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel(/Essential features/).fill('Eight microphone inputs and USB-C');
  await page.getByRole('button', { name: 'Continue' }).click();
  const title = 'Portable field interface ' + Date.now();
  await page.getByLabel(/Product name/).fill(title);
  await page.getByRole('button', { name: /Review & publish/ }).click();
  await page.getByRole('button', { name: 'Publish idea' }).click();
  await expect(page.getByText('Your idea is published.')).toBeVisible();
  await page.getByRole('button', { name: 'View my idea' }).click();
  await expect(page.getByRole('heading', { name: title }).first()).toBeVisible();
  await page.getByRole('button', { name: "I'm interested" }).click();
  await page.getByRole('button', { name: 'Report a problem' }).click();
  await page.getByLabel(/Describe the issue/).fill('One input intermittently stops recording.');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Review report' }).click();
  await page.getByRole('button', { name: 'Submit report' }).click();
  await expect(page.getByText('Your report has been recorded.')).toBeVisible();
  await page.getByRole('button', { name: /My Products/ }).click();
  await expect(page.getByRole('heading', { name: 'My Products' })).toBeVisible();
});

test('responsive visitor navigation has no horizontal overflow', async ({ page }) => {
  for (const width of widths) {
    await page.setViewportSize({ width, height: 850 });
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Explore Ideas' }).first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole('button', { name: 'Explore Ideas' }).first().click();
    await expect(page.getByText('DEMO').first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('manufacturer controls remain role-gated', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Customer Demand', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Explore Ideas' }).first().click();
  await page.getByRole('button', { name: 'View idea' }).first().click();
  await expect(page.getByRole('button', { name: 'Manage offer & stages' })).toHaveCount(0);
});

test('checkout review labels Sandbox and explains ineligible offers', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Explore Ideas' }).first().click();
  await page.getByRole('button', { name: 'View idea' }).first().click();
  await expect(page.getByRole('button', { name: 'Review PayPal Sandbox checkout' })).toHaveCount(0);
});

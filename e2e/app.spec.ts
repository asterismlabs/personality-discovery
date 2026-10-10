import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

async function expectNoViolations(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
}

async function fillPage(page: Page): Promise<void> {
  await page.evaluate(() => {
    document.querySelectorAll<HTMLInputElement>('input[type="radio"][value="4"]').forEach((input) => {
      input.checked = true
      input.dispatchEvent(new Event('change', { bubbles: true }))
    })
  })
}

test('walks the questionnaire on a phone-sized screen without cross-origin requests', async ({ page }) => {
  const external: string[] = []
  page.on('request', (request) => {
    const url = request.url()
    if (url.startsWith('blob:') || url.startsWith('data:')) return
    if (new URL(url).hostname !== '127.0.0.1') external.push(url)
  })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('./')
  await expect(page.getByRole('heading', { name: 'Personality and interest discovery' })).toBeVisible()
  await expectNoViolations(page)

  await page.getByRole('button', { name: 'Start' }).click()
  await page.getByRole('button', { name: 'Start this section' }).click()
  await expect(page.getByRole('group', { name: /.+/ }).first()).toBeVisible()
  await expectNoViolations(page)

  for (let step = 0; step < 40; step += 1) {
    if (await page.getByRole('heading', { name: 'Your results' }).count()) break
    const start = page.getByRole('button', { name: 'Start this section' })
    if (await start.count()) {
      await start.click()
      continue
    }
    await fillPage(page)
    await page.getByRole('button', { name: /^(Continue|Next section|See results)$/ }).click()
  }

  await expect(page.getByRole('heading', { name: 'Your results' })).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Prompt' })).toHaveValue(/Treat them as tendencies, not facts\./)
  await expectNoViolations(page)
  expect(external).toEqual([])
})

test('shows profile shape and fixed follow-up questions when scores leave a tie and a values ceiling', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('./')
  await page.getByRole('button', { name: 'Start' }).click()
  await page.getByRole('button', { name: 'Start this section' }).click()

  for (let step = 0; step < 40; step += 1) {
    if (await page.getByRole('heading', { name: 'Your results' }).count()) break
    const start = page.getByRole('button', { name: 'Start this section' })
    if (await start.count()) {
      await start.click()
      continue
    }
    await fillPage(page)
    await page.evaluate(() => {
      document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach((input) => {
        input.checked = true
        input.dispatchEvent(new Event('change', { bubbles: true }))
      })
    })
    await page.getByRole('button', { name: /^(Continue|Next section|See results)$/ }).click()
  }

  await expect(page.getByRole('heading', { name: 'Your results' })).toBeVisible()

  for (const id of ['personality-details', 'interests-details', 'values-details', 'work-style-details', 'interpretation-details']) {
    await expect(page.getByTestId(id)).not.toHaveAttribute('open', '')
  }
  await expect(page.getByTestId('profile-summary')).toBeHidden()

  await page.getByTestId('interests-details').locator('summary').click()
  await expect(page.getByTestId('profile-summary')).toBeVisible()
  await expect(page.getByTestId('profile-summary')).toContainText('Generalist profile')
  await page.getByTestId('values-details').locator('summary').click()
  await expect(page.getByTestId('values-ceiling')).toContainText('6 of 6')

  const followUp = page.getByTestId('followup')
  await expect(followUp).toBeVisible()
  await expect(followUp.getByRole('group')).toHaveCount(4)
  await expect(followUp.getByRole('status').first()).toContainText('Not answered yet.')

  const interestGroups = page.getByTestId('followup-interests').getByRole('group')
  await interestGroups.nth(0).getByRole('radio').first().check()
  await expect(page.getByTestId('followup-interests').getByRole('status')).toContainText('The O*NET counts above are unchanged')

  const keepGroup = page.getByTestId('followup-values').getByRole('group').nth(0)
  await keepGroup.getByRole('radio').first().check()
  const dropGroup = page.getByTestId('followup-values').getByRole('group').nth(1)
  await expect(dropGroup.getByRole('radio')).toHaveCount(6)
  await dropGroup.getByRole('radio').first().check()
  await expect(page.getByTestId('followup-values').getByRole('status')).toContainText('Keep:')

  await expect(page.locator('#prompt-text')).toHaveValue(/Open ambiguities flagged by this app/)
  await expect(page.locator('#prompt-text')).toHaveValue(/Keep: /)
  await expectNoViolations(page)
})

test('welcome page has no accessibility violations on a wide screen', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('./')
  await expectNoViolations(page)
})

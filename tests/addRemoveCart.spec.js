const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { ProductPage } = require('../pages/ProductPage');

test.describe('Add and remove product to cart', () => {
    let loginPage;
    let productPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        productPage = new ProductPage(page);

        await page.goto('https://www.saucedemo.com/');
        await loginPage.login('standard_user','secret_sauce');
        await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
    });

    test('Add product to cart', async () => {
        await productPage.addCartBackPack.click();
        await expect(productPage.cartBadge).toHaveText('1');
    })
})
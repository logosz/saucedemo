const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { ProductPage } = require('../pages/ProductPage');
const { CartPage } = require('../pages/CartPage');
const { CheckoutPage } = require('../pages/CheckoutPage');

test.describe('Login-Add-Remove-Checkout-Logout', () => {
    let loginPage;
    let productPage;
    let cartPage;
    let checkoutPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        await loginPage.navigate();

        productPage = new ProductPage(page);
        cartPage = new CartPage(page);
        checkoutPage = new CheckoutPage(page);
    });

    test('End to End checkout product flow', async ({ page }) => {
        await loginPage.login('standard_user', 'secret_sauce');
        await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');

        await expect(productPage.cartBadge).toHaveCount(0);
        await productPage.addCartBackPack.click();
        await expect(productPage.cartBadge).toHaveCount(1);
        await expect(productPage.cartBadge).toHaveText('1');

        await productPage.cartButton.click();
        await expect(page).toHaveURL('https://www.saucedemo.com/cart.html');
        await cartPage.removeCartBackPack.click();
        await expect(productPage.cartBadge).toHaveCount(0);
        await expect(cartPage.emptyCart).toHaveCount(1);

        await cartPage.continueShoppingButton.click();
        await productPage.addCartBikeLight.click();
        await expect(productPage.cartBadge).toHaveCount(1);
        await expect(productPage.cartBadge).toHaveText('1');

        await productPage.cartButton.click();
        await expect(page).toHaveURL('https://www.saucedemo.com/cart.html');
        await expect(productPage.cartBadge).toHaveCount(1);
        await expect(productPage.cartBadge).toHaveText('1');
        await expect(cartPage.productInCart).toHaveCount(1);

        await cartPage.checkoutButton.click();
        await expect(page).toHaveURL('https://www.saucedemo.com/checkout-step-one.html');
        await expect(checkoutPage.firstNameField).toHaveCount(1);
        await expect(checkoutPage.lastNameField).toHaveCount(1);
        await expect(checkoutPage.zipField).toHaveCount(1);

        await checkoutPage.confirmation('Mikael', 'Mancini', '12345');
        await expect(page).toHaveURL('https://www.saucedemo.com/checkout-step-two.html');

        const totalProductPrice = await checkoutPage.getTotalPrice();
        const totalItemPrice = await checkoutPage.subTotalPriceAmount();
        const taxAmount = await checkoutPage.taxPriceAmount();
        const totalAmount = await checkoutPage.totalPriceAmount();

        expect(totalProductPrice).toEqual(totalItemPrice);
        expect(totalProductPrice).toEqual(parseFloat((totalAmount - taxAmount).toFixed(2)));

        await checkoutPage.finishButton.click();
        await expect(page).toHaveURL('https://www.saucedemo.com/checkout-complete.html');
        await expect(checkoutPage.backHomeButton).toHaveCount(1);
        await expect(checkoutPage.thanksTextHeader).toHaveText('Thank you for your order!');
        await expect(checkoutPage.thanksTextBody).toHaveText('Your order has been dispatched, and will arrive just as fast as the pony can get there!');

        await productPage.burgermenuButton.click();
        await productPage.sidebarLogout.click();
        await expect(page).toHaveURL('https://www.saucedemo.com/');
        await expect(loginPage.loginButton).toHaveCount(1);
    })
})
# ReCAPTCHA for StripeIntegration_Payments

This integration verifies recaptcha before sending data to Stripe server. 
It adds server side recaptcha verification and JS mixins for reCapctha.

### Installation

```
cd <magento_root>
composer config repositories.swissup-recaptcha-stripeintegration-payments vcs git@github.com:swissup/module-recaptcha-stripeintegration-payments.git
composer require swissup/module-recaptcha-stripeintegration-payments
bin/magento setup:upgrade
```


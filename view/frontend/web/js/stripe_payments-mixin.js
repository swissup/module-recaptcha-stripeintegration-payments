define([
    'jquery',
    'mage/url',
    'mage/translate',
    'mage/utils/wrapper',
    'Magento_Ui/js/modal/alert',
    'Magento_Checkout/js/model/full-screen-loader',
    'Swissup_Recaptcha/js/model/recaptcha-assigner'
], function ($, url, $t, wrapper, alert, loader, recaptchaAssigner) {
    'use strict';

    /**
     * Validate recaptcha response on server.
     * When success - proceed with successCallback
     *
     * @param  {function} successCallback
     */
    function validate(successCallback) {
        var recaptcha = recaptchaAssigner.getRecaptcha(),
            formId = recaptcha ? recaptcha.element.attr('id') : '';

        loader.startLoader();
        $.post(url.build("stripeIntegrationRecaptcha"), {
            form_id: formId,
            token: recaptcha.getResponse()
        }).then(function (response) {
            loader.stopLoader();
            if (response.status === 'ok') {
                return successCallback();
            }

            alert({
                title: $t('Place Order'),
                content: response.message || $t('Error occurred, please try again later.')
            });
        }).fail(function (response) {
            loader.stopLoader();
            alert({
                title: $t('Place Order'),
                content: $t('Error occurred, please try again later.')
            });
        });
    }

    return function (component) {
        component.prototype.placeOrder = wrapper.wrap(component.prototype.placeOrder, function () {
            var args = Array.prototype.slice.call(arguments),
                originalMethod = args.shift(args),
                recaptcha = recaptchaAssigner.getRecaptcha(),
                formId = recaptcha ? recaptcha.element.attr('id') : '',
                originalCtx = this;

            if (recaptcha &&
                recaptcha.options.size === 'invisible' &&
                !recaptcha.getResponse()
            ) {
                // It is invisible recaptcha. We have to postpone original action.
                // And call it when recaptcha response received.
                recaptcha.element.one('recaptchaexecuted', function () {
                    validate(originalMethod.bind(originalCtx, ...args));
                });
                recaptcha.execute();

                return;
            }

            validate(originalMethod.bind(originalCtx, ...args));
        });

        return component;
    }
});

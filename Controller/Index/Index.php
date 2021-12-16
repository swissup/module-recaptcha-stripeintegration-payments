<?php
namespace Swissup\RecaptchaStripeIntegrationPayments\Controller\Index;

use Magento\Framework\App\Action\Action;
use Magento\Framework\Controller\ResultFactory;
use Magento\Framework\App\Action\Context;

class Index extends Action
{
    private $helper;

    /**
     * @param \Magento\Captcha\Helper\Data $helper
     * @param Context                     $context
     */
    public function __construct(
        \Magento\Captcha\Helper\Data $helper,
        Context $context
    ) {
        $this->helper = $helper;
        parent::__construct($context);
    }

    /**
     * @inheritdoc
     */
    public function execute()
    {
        /** @var \Magento\Framework\Controller\Result\Redirect $resultRedirect */
        $resultRedirect = $this->resultRedirectFactory->create();
        $formId = $this->getRequest()->getParam('form_id', '');
        if (!$formId) {
            return $this->sendJson([
                'status' => 'error',
                'message' => __("Form ID is required.")
            ]);
        }

        $captcha = $formId ? $this->helper->getCaptcha($formId) : null;

        if ($captcha && $captcha->isRequired()) {
            $token = $this->getRequest()->getParam('token', '');
            $response = $captcha->verify($token);
            $isSuccess = $response && $response->isSuccess();

            if (!$isSuccess) {
                $errors = implode($response->getErrorCodes());

                return $this->sendJson([
                    'status' => 'error',
                    'message' => __("Invalid recaptcha. [error-code: %1]", $errors)
                ]);
            }
        }

        return $this->sendJson(['status' => 'ok']);
    }

    /**
     * @param  array $data
     * @return \Magento\Framework\Controller\Result
     */
    private function sendJson($data) {
        return $this->resultFactory->create(ResultFactory::TYPE_JSON)->setData($data);
    }
}

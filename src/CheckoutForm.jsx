import React, { useState } from "react";
import {
  PaymentElement,
  ContactDetailsElement,
  useCheckoutElements
} from '@stripe/react-stripe-js/checkout';

const CheckoutForm = () => {
  const [message, setMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const checkoutState = useCheckoutElements();

  if (checkoutState.type === 'loading') {
    return (
      <div>Loading...</div>
    );
  }

  if (checkoutState.type === 'error') {
    return (
      <div>Error: {checkoutState.error.message}</div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {checkout} = checkoutState;
    setIsSubmitting(true);

    const confirmResult = await checkout.confirm();

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (confirmResult.type === 'error') {
      setMessage(confirmResult.error.message);
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h4>Contact Details</h4>
      <ContactDetailsElement/>
      <h4>Payment</h4>
      <PaymentElement id="payment-element" />
      <button disabled={!checkoutState.checkout.canConfirm || isSubmitting} id="submit">
        {isSubmitting ? (
          <div className="spinner"></div>
        ) : (
          `Pay ${checkoutState.checkout.total.total.amount} now`
        )}
      </button>
      {/* Show any error or success messages */}
      {message && <div id="payment-message">{message}</div>}
    </form>
  );
}

export default CheckoutForm;
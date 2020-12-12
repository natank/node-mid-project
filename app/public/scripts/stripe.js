var stripe = Stripe('pk_test_ONmXQwGjCyI0CVdXNjQrDUnq00vDxZmvml');

export async function createOrder(sessionId) {
  console.log(JSON.stringify(sessionId))
  const {
    error
  } = await stripe.redirectToCheckout({
    // Make the id field from the Checkout Session creation API response
    // available to this file, so you can provide it as parameter here
    // instead of the {{CHECKOUT_SESSION_ID}} placeholder.
    sessionId: sessionId
  })
  // If `redirectToCheckout` fails due to a browser or network
  // error, display the localized error message to your customer
  // using `error.message`.
}

window.createOrder = createOrder;
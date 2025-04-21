import Stripe from "stripe";

// Vérifier si nous sommes côté serveur
const isServer = typeof window === "undefined";

// Initialiser Stripe uniquement côté serveur
let stripe: Stripe | null = null;

if (isServer) {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Missing STRIPE_SECRET_KEY environment variable");
  }

  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16", // Utiliser la dernière version de l'API Stripe
  });
}

export { stripe };

// Fonctions qui ne doivent être utilisées que côté serveur
export const createStripeCheckoutSession = async ({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
}: {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}) => {
  if (!isServer || !stripe) {
    throw new Error("Cette fonction ne peut être utilisée que côté serveur");
  }

  return await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
};

export const createStripeCustomer = async ({
  email,
  name,
}: {
  email: string;
  name?: string;
}) => {
  if (!isServer || !stripe) {
    throw new Error("Cette fonction ne peut être utilisée que côté serveur");
  }

  return await stripe.customers.create({
    email,
    name,
  });
};

export const createStripePortalSession = async ({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) => {
  if (!isServer || !stripe) {
    throw new Error("Cette fonction ne peut être utilisée que côté serveur");
  }

  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
};

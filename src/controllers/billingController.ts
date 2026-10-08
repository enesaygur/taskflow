import { Response, Request } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { AppError } from "../utils/AppError";
import { prisma } from "../lib/prisma";
import { stripe } from "../lib/stripe";
import { PRICE_TO_PLAN } from "../constants/plans";

export const createCheckoutSession = async (
  req: AuthRequest,
  res: Response,
) => {
  const organizationId = req.params.organizationId as string;
  const { plan } = req.body;

  if (plan !== "PRO" && plan !== "ENTERPRISE") {
    throw new AppError("Invalid plan", 400);
  }

  const organization = await prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
  });

  if (!organization) {
    throw new AppError("Organization not found", 404);
  }

  if (organization.stripeSubscriptionId) {
    const existingSubscription = await stripe.subscriptions.retrieve(
      organization.stripeSubscriptionId,
    );

    if (existingSubscription.status === "active") {
      throw new AppError(
        "This organization already has an active subscription. Use 'Manage subscription' to change your plan.",
        409,
      );
    }
  }

  let customerId = organization.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      metadata: {
        organizationId,
      },
    });

    customerId = customer.id;

    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        stripeCustomerId: customerId,
      },
    });
  }

  const priceId =
    plan === "PRO"
      ? (process.env.STRIPE_PRICE_PRO as string)
      : (process.env.STRIPE_PRICE_ENTERPRISE as string);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url:
      "http://localhost:5173/organizations/" +
      organizationId +
      "/billing?success=true",
    cancel_url:
      "http://localhost:5173/organizations/" +
      organizationId +
      "/billing?cancalled=true",
    metadata: { organizationId },
  });

  res.json({ url: session.url });
};

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string,
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const organizationId = session.metadata?.organizationId;
    if (organizationId) {
      await prisma.organization.update({
        where: { id: organizationId },
        data: { stripeSubscriptionId: session.subscription },
      });
    }
  }

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object as any;
    const customerId = subscription.customer;

    const organization = await prisma.organization.findFirst({
      where: { stripeCustomerId: customerId },
    });

    const isOtherSubscription =
      event.type !== "customer.subscription.created" &&
      organization?.stripeSubscriptionId != null &&
      organization?.stripeSubscriptionId !== subscription.id;

    if (organization && !isOtherSubscription) {
      if (
        event.type === "customer.subscription.deleted" ||
        subscription.status !== "active"
      ) {
        await prisma.organization.update({
          where: { id: organization.id },
          data: { plan: "FREE", stripeSubscriptionId: null },
        });
      } else {
        const priceId = subscription.items.data[0].price.id;
        const newPlan = PRICE_TO_PLAN[priceId];

        await prisma.organization.update({
          where: { id: organization.id },
          data: { plan: newPlan },
        });
      }
    }
  }

  res.status(200).json({ received: true });
};

export const createPortalSession = async (req: AuthRequest, res: Response) => {
  const organizationId = req.params.organizationId as string;

  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
  });

  if (!organization?.stripeCustomerId) {
    throw new AppError("No billing account for this organization", 400);
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: organization.stripeCustomerId,
    return_url: `http://localhost:5173/organizations/${organizationId}/billing`,
  });

  return res.json({ url: session.url });
};

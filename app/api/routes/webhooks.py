"""
Webhook endpoints for Stripe (placeholder). Validate using STRIPE_WEBHOOK_SECRET.
This endpoint should be configured in Stripe dashboard to receive events.
"""
from fastapi import APIRouter, Header, HTTPException, Request
import stripe
from app.core.config import settings

router = APIRouter()
stripe.api_key = settings.STRIPE_API_KEY

@router.post("/stripe")
async def stripe_webhook(request: Request, stripe_signature: str = Header(None)):
    payload = await request.body()
    sig_header = stripe_signature
    if not settings.STRIPE_WEBHOOK_SECRET:
        # For dev, we just accept the event
        return {"received": True, "note": "No webhook secret configured; ignoring signature verification"}
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Webhook error: {str(e)}")
    # Handle events (invoice.payment_succeeded, customer.subscription.updated, etc.)
    # TODO: map Stripe customer <-> user and update subscription status in DB.
    return {"received": True}

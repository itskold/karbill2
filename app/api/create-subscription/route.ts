import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { subscriptionService, planFeatures, type planTypes } from '@/components/subscription/subscription.schema';

// Initialiser Stripe avec la clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any, // Forcer le type pour éviter l'erreur de version API
});

export async function POST(request: Request) {
  try {
    // Extraire les données de la requête
    const { plan, userId } = await request.json();

    // Vérifier que les paramètres requis sont présents
    if (!plan || !userId) {
      return NextResponse.json(
        { error: 'Les paramètres plan et userId sont requis' },
        { status: 400 }
      );
    }

    // Vérifier que le plan est valide
    if (plan !== 'basic' && plan !== 'pro') {
      return NextResponse.json(
        { error: 'Plan non valide' },
        { status: 400 }
      );
    }

    // Récupérer les détails du plan
    const validPlan = plan as 'basic' | 'pro';
    const planDetails = planFeatures[validPlan];
    
    // Récupérer l'ID du prix correspondant au plan
    const priceId = validPlan === 'basic' 
      ? process.env.STRIPE_PRICE_BASIC 
      : process.env.STRIPE_PRICE_PRO;
      
    if (!priceId) {
      return NextResponse.json(
        { error: 'ID de prix Stripe non configuré pour ce plan' },
        { status: 500 }
      );
    }
    
    // Créer ou récupérer un client Stripe
    let customerId;
    
    try {
      // Vérifier si l'utilisateur a déjà un ID client Stripe
      const subscription = await subscriptionService.getActiveSubscription(userId);
      
      if (subscription?.stripeCustomerId) {
        customerId = subscription.stripeCustomerId;
      } else {
        // Créer un nouveau client Stripe
        const customer = await stripe.customers.create({
          metadata: {
            userId,
          },
        });
        
        customerId = customer.id;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération/création du client Stripe:', error);
      
      // Créer un nouveau client Stripe en cas d'erreur
      const customer = await stripe.customers.create({
        metadata: {
          userId,
        },
      });
      
      customerId = customer.id;
    }

    // Option 2: Créer une session de configuration avec les prix existants
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/register?success=true&plan=${plan}&userId=${userId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout?plan=${plan}&userId=${userId}`,
    });

    // Sauvegarder temporairement la référence à la session dans Firestore
    try {
      await subscriptionService.setSubscription(userId, "temp_" + session.id, {
        userId,
        planType: validPlan,
        status: "pending",
        stripeCustomerId: customerId,
        createdAt: new Date(),
      });
    } catch (err) {
      console.error("Erreur lors de la sauvegarde de la session temporaire:", err);
      // Ne pas bloquer le flux si la sauvegarde échoue
    }

    return NextResponse.json({
      sessionId: session.id,
      checkoutUrl: session.url,
    });
    
  } catch (error: any) {
    console.error('Erreur lors de la création de l\'abonnement:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'abonnement' },
      { status: 500 }
    );
  }
} 
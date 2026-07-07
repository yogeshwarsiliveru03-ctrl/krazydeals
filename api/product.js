// api/product.js — Vercel Edge Function
// When WhatsApp/Telegram/Instagram scrapes a product link like:
// krazydeals-ebvr.vercel.app/?product=PRODUCT_ID
// This function intercepts and returns HTML with the correct
// product image, name, price in Open Graph meta tags.
// The user's browser then loads the normal React app.

import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD7dIU9FpgwJAqxZkXH3IxHBX1YMiXxJu4",
  authDomain: "krazydeals-2b8a4.firebaseapp.com",
  projectId: "krazydeals-2b8a4",
  storageBucket: "krazydeals-2b8a4.firebasestorage.app",
  messagingSenderId: "261015279937",
  appId: "1:261015279937:web:ac7c466903426a397e69c0"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

export const config = { runtime: "edge" };

export default async function handler(req) {
  const url = new URL(req.url);
  const productId = url.searchParams.get("product");

  if (!productId) {
    return new Response("Missing product ID", { status: 400 });
  }

  let product = null;
  try {
    const snap = await getDoc(doc(db, "products", productId));
    if (snap.exists()) product = snap.data();
  } catch (e) {
    console.error("Firestore error:", e);
  }

  if (!product) {
    return new Response("Product not found", { status: 404 });
  }

  const siteUrl = "https://krazydeals-ebvr.vercel.app";
  const title = `${product.name} — Rs.${product.price} (${product.discount}% OFF) | Krazy Deals`;
  const description = product.description
    ? `${product.description} | Original price Rs.${product.originalPrice}. Save Rs.${product.originalPrice - product.price}!`
    : `Get ${product.name} at Rs.${product.price} — ${product.discount}% OFF! Shop now on Krazy Deals.`;
  const image = product.image || `${siteUrl}/og-image.jpg`;
  const productUrl = `${siteUrl}/?product=${productId}`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
  <meta name="description" content="${description}"/>

  <!-- Open Graph (WhatsApp, Facebook, Telegram) -->
  <meta property="og:type" content="product"/>
  <meta property="og:url" content="${productUrl}"/>
  <meta property="og:title" content="${title}"/>
  <meta property="og:description" content="${description}"/>
  <meta property="og:image" content="${image}"/>
  <meta property="og:image:width" content="800"/>
  <meta property="og:image:height" content="800"/>
  <meta property="og:site_name" content="Krazy Deals"/>
  <meta property="og:locale" content="en_IN"/>
  <meta property="product:price:amount" content="${product.price}"/>
  <meta property="product:price:currency" content="INR"/>

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="${title}"/>
  <meta name="twitter:description" content="${description}"/>
  <meta name="twitter:image" content="${image}"/>

  <meta name="theme-color" content="#F26522"/>

  <!-- Redirect to React app immediately for real users -->
  <script>
    // Only redirect if not a bot/scraper
    var ua = navigator.userAgent.toLowerCase();
    var isBot = /whatsapp|telegram|facebot|facebookexternalhit|twitterbot|linkedinbot|slackbot|discordbot|bot|crawler|spider/.test(ua);
    if (!isBot) {
      window.location.replace("${siteUrl}/?product=${productId}");
    }
  </script>
</head>
<body>
  <h1>${product.name}</h1>
  <p>Price: Rs.${product.price} (${product.discount}% OFF)</p>
  <img src="${image}" alt="${product.name}" style="max-width:400px"/>
  <p>${description}</p>
  <a href="${product.affiliateLink}">Buy Now</a>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
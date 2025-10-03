import 'dotenv/config'
import fetch from 'node-fetch'

const shop = process.env.SHOPIFY_SHOP
const token = process.env.SHOPIFY_ADMIN_TOKEN

async function test() {
  const url = `https://${shop}/admin/api/2025-07/shop.json`
  const res = await fetch(url, {
    headers: {
      "X-Shopify-Access-Token": token,
      "Content-Type": "application/json"
    }
  })
  const data = await res.json()
  console.log(JSON.stringify(data, null, 2))
}

test().catch(err => {
  console.error("❌ Erreur :", err)
  process.exit(1)
})

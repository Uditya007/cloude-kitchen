# Desi Rajasthan

Food ordering site prepared for Vercel deployment with static assets in the project root and a Python serverless function at `api/order.py` for Telegram order notifications.

## Ready for Vercel

- `index.html`, `styles.css`, `script.js`, and `assets/*` are deployed as static files
- `api/order.py` is deployed as a Vercel Python Function at `/api/order`
- product and logo images are included locally, so they deploy with the site

## Vercel environment variables

Add these in your Vercel project settings:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

## Deploy steps

1. Push this folder to GitHub
2. Import the repo into Vercel
3. Add the Telegram environment variables in Vercel
4. Deploy

## GitHub checklist

- Keep `.env` out of the repository
- Push the full `assets/` folder so all logo and food images deploy correctly
- Verify `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are added only in Vercel, not in code

## Important

- Do not hardcode your Telegram bot token in frontend files
- Regenerate the token if it was ever shared publicly
- Vercel will use `api/order.py` to send the order message to your Telegram chat

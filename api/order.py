import json
import os
from http.server import BaseHTTPRequestHandler
from urllib import error, request


def send_json(handler, payload, status=200):
  body = json.dumps(payload).encode("utf-8")
  handler.send_response(status)
  handler.send_header("Content-Type", "application/json")
  handler.send_header("Content-Length", str(len(body)))
  handler.send_header("Access-Control-Allow-Origin", "*")
  handler.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
  handler.send_header("Access-Control-Allow-Headers", "Content-Type")
  handler.end_headers()
  handler.wfile.write(body)


def send_telegram_message(message_text):
  token = os.environ.get("8628235618:AAHfD4VzEbVai-I8vZAIIptZQnMB77tFiLI", "")
chat_id = os.environ.get("5486753321", "")

  if not token or not chat_id:
    raise RuntimeError(
      "Telegram API is not configured. Add TELEGRAM_BOT_TOKEN and "
      "TELEGRAM_CHAT_ID in Vercel environment variables."
    )

  api_url = f"https://api.telegram.org/bot{token}/sendMessage"
  payload = json.dumps({
    "chat_id": chat_id,
    "text": message_text
  }).encode("utf-8")

  req = request.Request(
    api_url,
    data=payload,
    headers={
      "Content-Type": "application/json"
    },
    method="POST"
  )

  try:
    with request.urlopen(req, timeout=20) as response:
      return json.loads(response.read().decode("utf-8"))
  except error.HTTPError as exc:
    details = exc.read().decode("utf-8")
    raise RuntimeError(f"Telegram API error: {details}") from exc


class handler(BaseHTTPRequestHandler):
  def do_OPTIONS(self):
    send_json(self, {"ok": True}, status=200)

  def do_POST(self):
    content_length = int(self.headers.get("Content-Length", "0"))
    raw_body = self.rfile.read(content_length)

    try:
      payload = json.loads(raw_body.decode("utf-8"))
    except json.JSONDecodeError:
      send_json(self, {"error": "Invalid JSON payload."}, status=400)
      return

    required_fields = ["customer_name", "flat_tower", "phone", "delivery_address", "items", "message"]
    missing = [field for field in required_fields if not payload.get(field)]

    if missing:
      send_json(self, {"error": f"Missing required fields: {', '.join(missing)}"}, status=400)
      return

    try:
      api_result = send_telegram_message(payload["message"])
    except RuntimeError as exc:
      send_json(self, {"error": str(exc)}, status=500)
      return

    send_json(self, {"ok": True, "result": api_result}, status=200)

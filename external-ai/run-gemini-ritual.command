#!/bin/sh

cd "$(dirname "$0")/.." || exit 1

echo ""
echo "Synthetic Salon / Gemini invitation ritual"
echo "------------------------------------------"
echo "Paste a fresh Gemini API key from Google AI Studio when asked."
echo "The input is hidden. Do not paste a key that has been shared in chat."
echo ""

unset GEMINI_API_KEY
unset GOOGLE_API_KEY

restore_echo() {
  stty echo 2>/dev/null || true
}
trap restore_echo EXIT INT TERM

printf "Gemini API key: "
stty -echo 2>/dev/null || true
IFS= read -r GEMINI_API_KEY
restore_echo
printf "\n"

if [ -z "$GEMINI_API_KEY" ]; then
  echo "No key entered. Ritual cancelled."
  echo ""
  printf "Press Return to close this window."
  IFS= read -r _
  exit 1
fi

export GEMINI_API_KEY

echo ""
echo "Inviting Gemini. This sends curated public salon context only."
echo ""

python3 external-ai/gemini_salon_invitation.py
status=$?

unset GEMINI_API_KEY

echo ""
if [ "$status" -eq 0 ]; then
  echo "Gemini ritual complete."
else
  echo "Gemini ritual did not complete."
  echo "If you see an API-key error, create a fresh Gemini API key in Google AI Studio."
fi
echo ""
printf "Press Return to close this window."
IFS= read -r _
exit "$status"

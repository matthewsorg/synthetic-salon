#!/bin/sh

cd "$(dirname "$0")/.." || exit 1

echo ""
echo "Synthetic Salon / Qwen mid-season ritual (the forbidden room)"
echo "----------------------------------------"
echo "Paste a fresh DashScope / Alibaba Model Studio key when asked."
echo "The input is hidden. Do not use a key that was pasted into chat."
echo ""

unset DASHSCOPE_API_KEY
export DASHSCOPE_COMPAT_BASE_URL="https://dashscope-intl.aliyuncs.com/compatible-mode/v1"

restore_echo() {
  stty echo 2>/dev/null || true
}
trap restore_echo EXIT INT TERM

printf "DashScope API key: "
stty -echo 2>/dev/null || true
IFS= read -r DASHSCOPE_API_KEY
restore_echo
printf "\n"

if [ -z "$DASHSCOPE_API_KEY" ]; then
  echo "No key entered. Ritual cancelled."
  echo ""
  printf "Press Return to close this window."
  IFS= read -r _
  exit 1
fi

export DASHSCOPE_API_KEY

echo ""
echo "Inviting Qwen. This sends curated public salon context only."
echo ""

python3 external-ai/qwen_midseason_ritual.py
status=$?

unset DASHSCOPE_API_KEY

echo ""
if [ "$status" -eq 0 ]; then
  echo "Qwen ritual complete."
else
  echo "Qwen ritual did not complete."
  echo "If you see 401 invalid_api_key, revoke that key and create a fresh international Model Studio key."
fi
echo ""
printf "Press Return to close this window."
IFS= read -r _
exit "$status"

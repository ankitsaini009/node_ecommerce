/**
 * Allowed intents for the chatbot. Any other value will be mapped to normal_chat.
 */
const ALLOWED_INTENTS = new Set([
  'cancel_order',
  'track_order',
  'ask_order_id',
  'confirm_action',
  'normal_chat',
  'product_search',
]);

function validateIntent(intent) {
  if (typeof intent !== 'string') return 'normal_chat';
  if (ALLOWED_INTENTS.has(intent)) return intent;
  return 'normal_chat';
}

module.exports = { validateIntent };

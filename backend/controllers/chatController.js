const aiService = require("../services/aiService");
const intentService = require("../services/intentService");
const orderService = require("../services/orderService");
const productService = require("../services/productService");
const { buildProductContext } = require("../utils/contextBuilder");

function extractOrderIdFromText(text) {
  if (!text || typeof text !== "string") return null;
  const match = text.match(/\b\d{1,12}\b/);
  return match ? match[0] : null;
}

function getChatState(req) {
  if (!req.session.chatState) {
    req.session.chatState = { pendingIntent: null, lastOrderId: null };
  }
  return req.session.chatState;
}

async function chat(req, res) {
  try {
    const { message } = req.body;
    if (!message || typeof message !== "string" || !message.trim()) {
      return res
        .status(400)
        .json({ success: false, reply: "Message is required" });
    }

    const chatState = getChatState(req);
    const explicitOrderId = extractOrderIdFromText(message);

    // determine the user's intent using the LLM
    const aiReply = await aiService.detectIntent(message);
    let intent = intentService.validateIntent(aiReply.intent);

    // Preserve action continuity when user sends only an order id in follow-up.
    if (
      chatState.pendingIntent &&
      explicitOrderId &&
      ["cancel_order", "track_order"].includes(chatState.pendingIntent)
    ) {
      intent = chatState.pendingIntent;
      aiReply.orderId = explicitOrderId;
    }

    switch (intent) {
      case "product_search": {
        const query = aiReply.query || message;
        const products = await productService.searchProducts(query);
        const context = buildProductContext(products);
        const responseText = await aiService.generateResponseWithContext(
          context,
          message,
        );
        return res.json({ success: true, reply: responseText });
      }

      case "track_order": {
        const orderId = aiReply.orderId || explicitOrderId || chatState.lastOrderId;
        if (!orderId) {
          chatState.pendingIntent = "track_order";
          return res.json({
            success: false,
            reply: "Please provide your order ID to track.",
          });
        }
        chatState.pendingIntent = null;
        chatState.lastOrderId = orderId;
        const status = await orderService.getOrderStatus(orderId);
        if (status === null) {
          return res.json({ success: false, reply: "Order not found." });
        }
        return res.json({
          success: true,
          reply: `Your order ${orderId} is currently ${status}.`,
        });
      }

      case "cancel_order": {
        const orderId = aiReply.orderId || explicitOrderId || chatState.lastOrderId;
        if (!orderId) {
          chatState.pendingIntent = "cancel_order";
          return res.json({
            success: false,
            reply: "Please provide your order ID.",
          });
        }
        chatState.pendingIntent = null;
        chatState.lastOrderId = orderId;
        const result = await orderService.cancelOrder(orderId);
        if (!result.success) {
          return res.json({
            success: false,
            reply: result.message || "Unable to cancel order.",
          });
        }
        return res.json({
          success: true,
          reply: `Order ${orderId} has been cancelled.`,
        });
      }

      case "ask_order_id":
        chatState.pendingIntent = "track_order";
        return res.json({
          success: true,
          reply: "Please provide your order ID.",
        });

      case "confirm_action":
        chatState.pendingIntent = "cancel_order";
        return res.json({
          success: true,
          reply: "Please provide the order ID to confirm.",
        });

      case "normal_chat":
      default:
        chatState.pendingIntent = null;
        return res.json({
          success: true,
          reply: aiReply.reply || "How can I assist you today?",
        });
    }
  } catch (err) {
    console.error("chatController error", err);
    return res.json({
      success: false,
      reply:
        "I am having trouble right now. Please share your order ID or product query and I will help.",
    });
  }
}

module.exports = { chat };


const crypto = require('crypto');
const { handleEvent } = require('./eventHandlers');

// Store processed event IDs
const _processedIds = new Set();

function handleWebhook(req, res) {
  try {
    // 1. Get the signature from request headers
    const signature = req.headers['x-webhook-signature'];

    // 2. Reject missing or invalid signatures
    if (
      !signature ||
      !signature.startsWith('sha256=') ||
      !Buffer.isBuffer(req.body)
    ) {
      return res.status(401).json({ status: 'unauthorized' });
    }

    // 3. Calculate HMAC-SHA256 using the raw request body
    const expectedSignature = crypto
      .createHmac('sha256', process.env.WEBHOOK_SECRET)
      .update(req.body)
      .digest('hex');

    const receivedSignature = signature.slice(7);

    // 4. Compare signatures safely
    if (
      !/^[a-fA-F0-9]{64}$/.test(receivedSignature) ||
      !crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(receivedSignature, 'hex')
      )
    ) {
      return res.status(401).json({ status: 'unauthorized' });
    }

    // 5. Parse the event only after verification
    const event = JSON.parse(req.body);

    // 6. Check whether this event was already processed
    if (_processedIds.has(event.id)) {
      return res.status(200).json({
        status: 'already_processed'
      });
    }

    // 7. Mark the event before processing
    _processedIds.add(event.id);

    // 8. Acknowledge immediately
    res.status(200).json({
      status: 'received'
    });

    // 9. Process in the background after responding
    setImmediate(() => {
      handleEvent(event);
    });

  } catch (error) {
    if (!res.headersSent) {
      return res.status(400).json({
        status: 'invalid_request'
      });
    }
  }
}

module.exports = {
  handleWebhook,
  _processedIds
};

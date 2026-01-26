const Redis = require('ioredis');

/**
 * Redis Pub/Sub Manager for cross-worker WebSocket communication
 * Enables message delivery between users connected to different worker processes
 */
class PubSubManager {
  constructor() {
    // Create separate Redis clients for publishing and subscribing
    // This is a Redis best practice to avoid blocking
    this.publisher = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    this.subscriber = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

    // Store message handlers for different channels
    this.handlers = new Map();

    // Track connection status
    this.publisherReady = false;
    this.subscriberReady = false;

    this.setupConnectionHandlers();
  }

  /**
   * Set up Redis connection event handlers
   */
  setupConnectionHandlers() {
    // Publisher events
    this.publisher.on('connect', () => {
      console.log('📤 Redis Publisher connected');
      this.publisherReady = true;
    });

    this.publisher.on('error', (err) => {
      console.error('❌ Redis Publisher error:', err.message);
      this.publisherReady = false;
    });

    this.publisher.on('close', () => {
      console.warn('⚠️  Redis Publisher connection closed');
      this.publisherReady = false;
    });

    // Subscriber events
    this.subscriber.on('connect', () => {
      console.log('📥 Redis Subscriber connected');
      this.subscriberReady = true;
    });

    this.subscriber.on('error', (err) => {
      console.error('❌ Redis Subscriber error:', err.message);
      this.subscriberReady = false;
    });

    this.subscriber.on('close', () => {
      console.warn('⚠️  Redis Subscriber connection closed');
      this.subscriberReady = false;
    });

    // Handle incoming messages
    this.subscriber.on('message', (channel, message) => {
      this.handleMessage(channel, message);
    });
  }

  /**
   * Publish a message to a Redis channel
   * @param {string} channel - Channel name
   * @param {Object} data - Data to publish
   * @returns {Promise<number>} Number of subscribers that received the message
   */
  async publish(channel, data) {
    if (!this.publisherReady) {
      console.warn('⚠️  Redis Publisher not ready, message not sent');
      return 0;
    }

    try {
      const message = JSON.stringify(data);
      const numSubscribers = await this.publisher.publish(channel, message);
      return numSubscribers;
    } catch (error) {
      console.error(`❌ Error publishing to channel ${channel}:`, error.message);
      return 0;
    }
  }

  /**
   * Subscribe to a Redis channel
   * @param {string} channel - Channel name
   * @param {Function} handler - Message handler function
   */
  subscribe(channel, handler) {
    this.handlers.set(channel, handler);
    this.subscriber.subscribe(channel, (err) => {
      if (err) {
        console.error(`❌ Error subscribing to channel ${channel}:`, err.message);
      } else {
        console.log(`✅ Subscribed to channel: ${channel}`);
      }
    });
  }

  /**
   * Unsubscribe from a Redis channel
   * @param {string} channel - Channel name
   */
  unsubscribe(channel) {
    this.handlers.delete(channel);
    this.subscriber.unsubscribe(channel, (err) => {
      if (err) {
        console.error(`❌ Error unsubscribing from channel ${channel}:`, err.message);
      } else {
        console.log(`🔕 Unsubscribed from channel: ${channel}`);
      }
    });
  }

  /**
   * Handle incoming messages from subscribed channels
   * @param {string} channel - Channel name
   * @param {string} message - Raw message string
   */
  handleMessage(channel, message) {
    const handler = this.handlers.get(channel);
    if (!handler) {
      console.warn(`⚠️  No handler registered for channel: ${channel}`);
      return;
    }

    try {
      const data = JSON.parse(message);
      handler(data);
    } catch (error) {
      console.error(`❌ Error handling message from channel ${channel}:`, error.message);
    }
  }

  /**
   * Initialize the Pub/Sub system
   * Must be called after setting up subscribers
   */
  init() {
    console.log('🚀 PubSub Manager initialized');
  }

  /**
   * Gracefully close connections
   */
  async close() {
    console.log('🛑 Closing PubSub Manager connections...');
    await Promise.all([
      this.publisher.quit(),
      this.subscriber.quit()
    ]);
    console.log('✅ PubSub Manager connections closed');
  }

  /**
   * Check if Pub/Sub is ready
   * @returns {boolean}
   */
  isReady() {
    return this.publisherReady && this.subscriberReady;
  }
}

// Create singleton instance
const pubSubManager = new PubSubManager();

module.exports = pubSubManager;

import mongoose from 'mongoose';
import dns from 'dns';
import fs from 'fs';
import {
  findOrCreateGeneralConversation,
  findOrCreateOrderConversation,
  getConversations,
  getConversationById,
  getConversationMessages,
  sendConversationMessage,
  markConversationAsRead,
  getOrderChatMessages,
  addOrderChatMessage,
} from '../src/lib/db.js';
import connectToDatabase from '../src/lib/mongodb.js';
import Conversation from '../src/models/Conversation.js';
import Message from '../src/models/Message.js';
import Order from '../src/models/Order.js';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

let uri = process.env.MONGODB_URI;
if (!uri && fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8');
  const match = envContent.match(/MONGODB_URI=(.+)/);
  if (match) {
    uri = match[1].trim();
    process.env.MONGODB_URI = uri;
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('TEST SUITE: UNIFIED CHAT & MESSAGING SYSTEM');
  console.log('====================================================\n');

  if (uri && mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 8000,
        connectTimeoutMS: 10000,
        family: 4,
      });
      console.log('Direct Mongoose connection established.');
    } catch (e) {
      console.warn('Mongoose connect warning:', e.message);
    }
  }

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    await connectToDatabase();
    console.log('Connected to Database successfully.\n');

    // Test Users
    const customer1 = {
      id: 'cust_test_101',
      name: 'Rohan Sharma',
      email: 'rohan.test@example.com',
      role: 'customer',
      phone: '+91 98765 43210',
    };

    const customer2 = {
      id: 'cust_test_102',
      name: 'Priya Patel',
      email: 'priya.test@example.com',
      role: 'customer',
      phone: '+91 91234 56789',
    };

    const adminUser = {
      id: 'admin_test_01',
      name: 'Store Manager',
      email: 'admin@nakodaimitation.com',
      role: 'admin',
    };

    // Prepare a mock test order
    const testOrderId = `TEST_ORD_${Date.now()}`;
    await Order.create({
      id: testOrderId,
      customerId: customer1.id,
      userId: customer1.id,
      customerName: customer1.name,
      customerEmail: customer1.email,
      customerPhone: customer1.phone,
      amount: 1499,
      status: 'shipped',
      statusLabel: 'Shipped',
      itemSummary: 'Royal Kundan Necklace Set (x1)',
      paymentMethod: 'UPI',
      deliveryAddress: '123 MG Road, Vapi, Gujarat',
    });

    // ─── TEST 1: Find or Create General Conversation ───
    console.log('--- Test 1: General Support Conversation ---');
    const genConv1 = await findOrCreateGeneralConversation(customer1);
    assert(genConv1 && genConv1.type === 'GENERAL', 'Created general conversation with type GENERAL');
    assert(genConv1.customerId === customer1.id, 'Correct customerId linked');
    assert(genConv1.orderId === null, 'orderId is null for general conversation');

    // Idempotency check: should return existing, not create duplicate
    const genConv1_again = await findOrCreateGeneralConversation(customer1);
    assert(genConv1.id === genConv1_again.id, 'Idempotent: returned existing general conversation without duplicate');

    // ─── TEST 2: Find or Create Order Conversation ───
    console.log('\n--- Test 2: Order-Specific Conversation & Duplicate Prevention ---');
    const ordConv1 = await findOrCreateOrderConversation(testOrderId, customer1);
    assert(ordConv1 && ordConv1.type === 'ORDER', 'Created order conversation with type ORDER');
    assert(ordConv1.orderId === testOrderId, 'Correct orderId linked');
    assert(ordConv1.orderSummary?.amount === 1499, 'Order summary cached with correct amount');
    assert(ordConv1.orderSummary?.status === 'shipped', 'Order summary cached with correct status');

    // Duplicate check: should return existing
    const ordConv1_again = await findOrCreateOrderConversation(testOrderId, customer1);
    assert(ordConv1.id === ordConv1_again.id, 'Idempotent: returned same conversation for order, no duplicate created');

    // Check count in database for this order
    const ordConvCount = await Conversation.countDocuments({ type: 'ORDER', orderId: testOrderId });
    assert(ordConvCount === 1, 'Database constraint verification: Exactly 1 conversation exists for this order');

    // ─── TEST 3: Sending Messages Customer -> Admin ───
    console.log('\n--- Test 3: Message Flow & Unread Counter Increment ---');
    const res1 = await sendConversationMessage(ordConv1.id, {
      content: 'Hello, when will my order arrive in Vapi?',
    }, customer1);
    const msg1 = res1.message;
    assert(msg1 && msg1.content === 'Hello, when will my order arrive in Vapi?', 'Customer message saved correctly');
    assert(msg1.senderRole === 'customer', 'senderRole set to customer');

    const ordConvUpdated = await Conversation.findOne({ id: ordConv1.id });
    assert(ordConvUpdated.lastMessage === 'Hello, when will my order arrive in Vapi?', 'Conversation lastMessage updated');
    assert(ordConvUpdated.unreadCountAdmin === 1, 'unreadCountAdmin incremented by 1');
    assert(ordConvUpdated.unreadCountCustomer === 0, 'unreadCountCustomer remains 0 for sender');

    // ─── TEST 4: Sending Message Admin -> Customer ───
    console.log('\n--- Test 4: Admin Reply & Recipient Counter Increment ---');
    const res2 = await sendConversationMessage(ordConv1.id, {
      content: 'Hi Rohan! It is out for delivery and should arrive by 4 PM today.',
    }, adminUser);
    const msg2 = res2.message;
    assert(msg2 && msg2.senderRole === 'admin', 'Admin message saved with senderRole: admin');

    const ordConvUpdated2 = await Conversation.findOne({ id: ordConv1.id });
    assert(ordConvUpdated2.lastMessage.includes('out for delivery'), 'lastMessage updated with admin reply');
    assert(ordConvUpdated2.unreadCountCustomer === 1, 'unreadCountCustomer incremented by 1 for customer');

    // ─── TEST 5: Message Listing & Ordering ───
    console.log('\n--- Test 5: Message History Retrieval ---');
    const history = await getConversationMessages(ordConv1.id, customer1);
    assert(history.messages.length === 2, 'Retrieved 2 conversation messages');
    assert(history.messages[0].senderRole === 'customer', 'Messages ordered chronologically (first: customer)');
    assert(history.messages[1].senderRole === 'admin', 'Messages ordered chronologically (second: admin)');

    // ─── TEST 6: Mark As Read Flow ───
    console.log('\n--- Test 6: Mark As Read Flow ---');
    await markConversationAsRead(ordConv1.id, customer1);
    const ordConvReadByCustomer = await Conversation.findOne({ id: ordConv1.id });
    assert(ordConvReadByCustomer.unreadCountCustomer === 0, 'unreadCountCustomer reset to 0 after customer reads');

    await markConversationAsRead(ordConv1.id, adminUser);
    const ordConvReadByAdmin = await Conversation.findOne({ id: ordConv1.id });
    assert(ordConvReadByAdmin.unreadCountAdmin === 0, 'unreadCountAdmin reset to 0 after admin reads');

    // Check message status updated to 'read'
    const msgsAfterRead = await Message.find({ conversationId: ordConv1.id });
    const allRead = msgsAfterRead.every((m) => m.status === 'read');
    assert(allRead, 'All messages marked with status: "read"');

    // ─── TEST 7: IDOR Security Defense (Authorization Isolation) ───
    console.log('\n--- Test 7: Security & IDOR Authorization Defense ---');
    let idorViewBlocked = false;
    try {
      await getConversationById(ordConv1.id, customer2); // customer2 is unauthorized
    } catch (e) {
      idorViewBlocked = true;
    }
    assert(idorViewBlocked, 'IDOR Defense: Customer 2 blocked from viewing Customer 1 conversation (Error thrown)');

    let idorSendBlocked = false;
    try {
      await sendConversationMessage(ordConv1.id, { content: 'Hack attempt' }, customer2);
    } catch (e) {
      idorSendBlocked = true;
    }
    assert(idorSendBlocked, 'IDOR Defense: Customer 2 blocked from sending message to Customer 1 conversation');

    let idorOrderChatBlocked = false;
    try {
      await findOrCreateOrderConversation(testOrderId, customer2);
    } catch (e) {
      idorOrderChatBlocked = true;
    }
    assert(idorOrderChatBlocked, 'IDOR Defense: Customer 2 blocked from creating/accessing chat for Customer 1 order');

    // Admin CAN view it:
    let adminCanView = false;
    try {
      const adminConv = await getConversationById(ordConv1.id, adminUser);
      if (adminConv) adminCanView = true;
    } catch (e) {}
    assert(adminCanView, 'Admin authorized: Admin can view any order conversation');

    // ─── TEST 8: Backward Compatibility with getOrderChatMessages & addOrderChatMessage ───
    console.log('\n--- Test 8: Legacy API Backward Compatibility ---');
    const legacyResult = await getOrderChatMessages(testOrderId, adminUser);
    assert(legacyResult && Array.isArray(legacyResult.chatMessages) && legacyResult.chatMessages.length >= 2, 'getOrderChatMessages() seamlessly returns unified messages');

    const legacySent = await addOrderChatMessage(testOrderId, 'Package handed to courier driver.', adminUser);
    assert(legacySent && legacySent.message?.message === 'Package handed to courier driver.', 'addOrderChatMessage() writes to unified conversation');

    // ─── CLEANUP TEST DATA ───
    console.log('\n--- Cleaning up test records ---');
    await Conversation.deleteMany({ id: { $in: [genConv1.id, ordConv1.id] } });
    await Message.deleteMany({ conversationId: { $in: [genConv1.id, ordConv1.id] } });
    await Order.deleteOne({ id: testOrderId });
    console.log('Cleaned up test conversations, messages, and order.');

  } catch (err) {
    console.error('Test suite error:', err);
    failed++;
  } finally {
    console.log('\n====================================================');
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');
    await mongoose.disconnect();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();

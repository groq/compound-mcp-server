import test from 'node:test';
import assert from 'node:assert';
import {
  realtimeToolArgsSchema,
  replToolArgsSchema
} from './server.js'; // Import the exported Zod schemas

test('Tool Argument Schemas', async (t) => {

  await t.test('Realtime Tool Schema Validation', () => {
    // Valid input
    const validResult1 = realtimeToolArgsSchema.safeParse({
      question: "What is the weather today?",
    });
    assert(validResult1.success, 'Valid input should parse successfully (1)');
    assert.strictEqual(validResult1.data?.question, "What is the weather today?");
    assert.strictEqual(validResult1.data?.model, 'compound-beta', 'Default model should be compound-beta');

    // Valid input with explicit model
    const validResult2 = realtimeToolArgsSchema.safeParse({
        question: "News summary?",
        model: "compound-beta-mini"
    });
    assert(validResult2.success, 'Valid input with model should parse successfully (2)');
    assert.strictEqual(validResult2.data?.model, 'compound-beta-mini');

    // Invalid input (missing question)
    const invalidResult1 = realtimeToolArgsSchema.safeParse({ model: "compound-beta" });
    assert(!invalidResult1.success, 'Missing question should fail parsing (3)');

    // Invalid input (wrong model enum)
    const invalidResult2 = realtimeToolArgsSchema.safeParse({ question: "Q?", model: "invalid-model" });
    assert(!invalidResult2.success, 'Invalid model enum should fail parsing (4)');

    // Invalid input (wrong type for question)
    const invalidResult3 = realtimeToolArgsSchema.safeParse({ question: 123 });
    assert(!invalidResult3.success, 'Wrong question type should fail parsing (5)');
  });

  await t.test('REPL Tool Schema Validation', () => {
    // Valid input
    const validResult1 = replToolArgsSchema.safeParse({
        question: "Calculate 5*5",
      });
    assert(validResult1.success, 'Valid input should parse successfully (6)');
    assert.strictEqual(validResult1.data?.question, "Calculate 5*5");
    assert.strictEqual(validResult1.data?.model, 'compound-beta', 'Default model should be compound-beta (7)');

    // Invalid input (missing question)
    const invalidResult1 = replToolArgsSchema.safeParse({});
    assert(!invalidResult1.success, 'Missing question should fail parsing (8)');
  });

}); 
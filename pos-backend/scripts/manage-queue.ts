import { Level } from 'level';

const DB_PATH = '.write-queue';

async function listQueue() {
  const db = new Level<string, string>(DB_PATH, { valueEncoding: 'utf8' });
  await db.open();

  console.log('=== Queue Contents ===\n');
  let count = 0;

  for await (const [key, value] of db.iterator()) {
    try {
      const op = JSON.parse(value);
      count++;
      console.log(`${count}. ID: ${key}`);
      console.log(`   Type: ${op.type}`);
      console.log(`   Attempts: ${op.attempts}`);
      console.log(`   Created: ${new Date(op.createdAt).toISOString()}`);
      console.log(`   Next Attempt: ${new Date(op.nextAttemptAt).toISOString()}`);
      console.log(`   Payload:`, JSON.stringify(op.payload, null, 2));
      console.log('');
    } catch (e) {
      console.log(`${count}. ID: ${key} - CORRUPTED`);
    }
  }

  console.log(`Total: ${count} operations in queue\n`);
  await db.close();
}

async function removeOperation(id: string) {
  const db = new Level<string, string>(DB_PATH, { valueEncoding: 'utf8' });
  await db.open();

  try {
    await db.del(id);
    console.log(`✅ Successfully removed operation: ${id}`);
  } catch (e) {
    console.error(`❌ Failed to remove operation: ${id}`, e);
  }

  await db.close();
}

async function clearAll() {
  const db = new Level<string, string>(DB_PATH, { valueEncoding: 'utf8' });
  await db.open();

  let count = 0;
  for await (const [key] of db.iterator()) {
    await db.del(key);
    count++;
  }

  console.log(`✅ Cleared ${count} operations from queue`);
  await db.close();
}

// Main
const command = process.argv[2];
const arg = process.argv[3];

(async () => {
  try {
    switch (command) {
      case 'list':
        await listQueue();
        break;
      case 'remove':
        if (!arg) {
          console.error('Usage: npm run queue:remove <operation-id>');
          process.exit(1);
        }
        await removeOperation(arg);
        break;
      case 'clear':
        console.log('⚠️  This will remove ALL operations from the queue!');
        await clearAll();
        break;
      default:
        console.log('Usage:');
        console.log('  npm run queue:list              - List all queued operations');
        console.log('  npm run queue:remove <id>       - Remove specific operation');
        console.log('  npm run queue:clear             - Clear all operations');
        process.exit(1);
    }
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
})();


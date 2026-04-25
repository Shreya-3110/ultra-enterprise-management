const { generateInstallmentSchedule } = require('../backend/utils/billingUtils');

const testGenerator = () => {
  const testCases = [
    { total: 12000, freq: 'MONTHLY', expectedCount: 12, expectedAmount: 1000 },
    { total: 10000, freq: 'QUARTERLY', expectedCount: 4, expectedAmount: 2500 },
    { total: 5000, freq: 'HALF_YEARLY', expectedCount: 2, expectedAmount: 2500 },
    { total: 1000, freq: 'YEARLY', expectedCount: 1, expectedAmount: 1000 },
    { total: 10000, freq: 'MONTHLY', expectedCount: 12, isUneven: true } // 10000 / 12 = 833.33
  ];

  console.log('--- STARTING INSTALLMENT GENERATOR TESTS ---');

  testCases.forEach((tc, index) => {
    console.log(`\nTest Case ${index + 1}: ${tc.freq} for ₹${tc.total}`);
    try {
      const result = generateInstallmentSchedule(tc.total, tc.freq, new Date('2026-04-01'));
      
      // 1. Check Count
      if (result.length !== tc.expectedCount) {
        console.error(`❌ FAILED: Expected ${tc.expectedCount} installments, got ${result.length}`);
      } else {
        console.log(`✅ Count: ${result.length}`);
      }

      // 2. Check Sum
      const totalSum = result.reduce((sum, inst) => sum + inst.amount, 0);
      if (totalSum !== tc.total) {
        console.error(`❌ FAILED: Sum mismatch. Expected ${tc.total}, got ${totalSum}`);
      } else {
        console.log(`✅ Sum: ₹${totalSum}`);
      }

      // 3. Check Dates (Sample first and last)
      if (result.length > 1) {
          const firstDate = result[0].dueDate;
          const secondDate = result[1].dueDate;
          const diffMonths = (secondDate.getFullYear() - firstDate.getFullYear()) * 12 + (secondDate.getMonth() - firstDate.getMonth());
          console.log(`✅ Interval: ${diffMonths} months`);
      }

      if (tc.isUneven) {
          console.log(`💡 Note: Uneven split check. Last installment: ₹${result[result.length-1].amount}`);
      }

    } catch (err) {
      console.error(`❌ ERROR: ${err.message}`);
    }
  });

  console.log('\n--- TESTS COMPLETE ---');
};

testGenerator();

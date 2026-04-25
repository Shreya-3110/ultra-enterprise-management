const { allocatePayment } = require('./backend/utils/billingUtils');

const testAllocation = () => {
  console.log('--- TESTING ALLOCATION LOGIC ---');

  const installments = [
    { amount: 5000, paidAmount: 0, dueDate: new Date('2024-01-01'), status: 'PENDING' },
    { amount: 5000, paidAmount: 0, dueDate: new Date('2024-02-01'), status: 'PENDING' }
  ];

  console.log('1. Initial Payment: 2000 (Should be PARTIAL for 1st installment)');
  let res = allocatePayment([...installments], 2000, 0);
  console.log('Remaining:', res.remainingAmount);
  console.log('Statuses:', res.updatedInstallments.map(i => i.status));
  console.log('Paid Amounts:', res.updatedInstallments.map(i => i.paidAmount));

  console.log('\n2. Second Payment: 3000 (Should clear 1st installment)');
  res = allocatePayment(res.updatedInstallments, 3000, 0);
  console.log('Remaining:', res.remainingAmount);
  console.log('Statuses:', res.updatedInstallments.map(i => i.status));
  console.log('Paid Amounts:', res.updatedInstallments.map(i => i.paidAmount));

  console.log('\n3. Excess Payment: 10000 (Should clear 2nd and leave 5000)');
  res = allocatePayment(res.updatedInstallments, 10000, 0);
  console.log('Remaining:', res.remainingAmount);
  console.log('Statuses:', res.updatedInstallments.map(i => i.status));
  console.log('Paid Amounts:', res.updatedInstallments.map(i => i.paidAmount));

  console.log('\n4. Overdue logic test:');
  const overdueInst = [
    { amount: 5000, paidAmount: 0, dueDate: new Date('2020-01-01'), status: 'PENDING' }
  ];
  res = allocatePayment(overdueInst, 1000, 500); // 1000 payment, 500 late fee
  console.log('Paid Amount (Principal):', res.updatedInstallments[0].paidAmount);
  console.log('Late Fees Collected:', res.totalLateFees);
  console.log('Status:', res.updatedInstallments[0].status);
};

testAllocation();

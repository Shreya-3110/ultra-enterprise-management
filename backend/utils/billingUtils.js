/**
 * Utility functions for advanced billing and installment allocation
 */

const allocatePayment = (installments, amount, lateFeePerInstallment = 0) => {
  let remainingAmount = amount;
  let totalLateFees = 0;
  const now = new Date();
  now.setHours(0,0,0,0);

  // 1. Mark overdue installments that haven't been marked yet
  installments.forEach(inst => {
    const dueDate = new Date(inst.dueDate);
    dueDate.setHours(0,0,0,0);
    
    if (inst.status !== 'PAID' && dueDate <= now) {
      if (inst.status !== 'OVERDUE') {
        inst.status = 'OVERDUE';
      }
    }
  });

  // 2. Define priority: OVERDUE -> PARTIAL -> PENDING
  // We process them chronologically within each priority
  const priorities = ['OVERDUE', 'PARTIAL', 'PENDING', 'PAID']; // Added PAID just in case of weird state
  
  const allocations = [];
  
  for (const priority of priorities) {
    if (priority === 'PAID') continue; // Don't allocate more to already paid
    for (const inst of installments) {
      if (remainingAmount <= 0) break;
      
      if (inst.status === priority) {
        const lateFeeCharge = (priority === 'OVERDUE' || priority === 'PARTIAL' && new Date(inst.dueDate) < now) 
          ? lateFeePerInstallment 
          : 0;
        
        const totalRequired = inst.amount - (inst.paidAmount || 0) + lateFeeCharge;
        const initialPaid = inst.paidAmount || 0;
        
        if (remainingAmount >= totalRequired) {
          // Can fully pay this installment + late fee
          inst.paidAmount = inst.amount;
          inst.status = 'PAID';
          remainingAmount -= totalRequired;
          totalLateFees += lateFeeCharge;
          
          allocations.push({
            name: `Installment (Due: ${new Date(inst.dueDate).toLocaleDateString()})`,
            amountAllocated: inst.amount - initialPaid,
            isFullyPaid: true
          });
        } else {
          // Partial payment
          let allocatedToPrincipal = 0;
          if (remainingAmount > lateFeeCharge) {
            const freshAmount = remainingAmount - lateFeeCharge;
            totalLateFees += lateFeeCharge;
            inst.paidAmount = (inst.paidAmount || 0) + freshAmount;
            allocatedToPrincipal = freshAmount;
            remainingAmount = 0;
            inst.status = 'PARTIAL';
          } else {
            totalLateFees += remainingAmount;
            remainingAmount = 0;
          }
          
          if (allocatedToPrincipal > 0) {
            allocations.push({
              name: `Installment (Due: ${new Date(inst.dueDate).toLocaleDateString()})`,
              amountAllocated: allocatedToPrincipal,
              isFullyPaid: false
            });
          }
        }
      }
    }
  }

  return {
    updatedInstallments: installments,
    remainingAmount,
    totalLateFees,
    allocations
  };
};

/**
 * Generates an array of installments based on frequency and start date
 */
const generateInstallmentSchedule = (totalAmount, frequency, startDateInput = new Date()) => {
  const installments = [];
  let count = 1;
  let intervalMonths = 1;

  switch (frequency) {
    case 'MONTHLY':
      count = 12;
      intervalMonths = 1;
      break;
    case 'QUARTERLY':
      count = 4;
      intervalMonths = 3;
      break;
    case 'HALF_YEARLY':
      count = 2;
      intervalMonths = 6;
      break;
    case 'YEARLY':
    case 'ONE_TIME':
      count = 1;
      intervalMonths = 0;
      break;
    default:
      throw new Error(`Unsupported frequency: ${frequency}`);
  }

  const baseAmount = Math.floor(totalAmount / count);
  const remainder = totalAmount % count;
  const startDate = new Date(startDateInput);

  for (let i = 0; i < count; i++) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(startDate.getMonth() + (i * intervalMonths));

    // Ensure the last installment absorbs any remainder
    const amount = (i === count - 1) ? baseAmount + remainder : baseAmount;

    installments.push({
      label: `${frequency.charAt(0) + frequency.slice(1).toLowerCase()} - Part ${i + 1}`,
      amount: amount,
      dueDate: dueDate,
      status: 'PENDING'
    });
  }

  return installments;
};

module.exports = {
  allocatePayment,
  generateInstallmentSchedule
};

import { PrismaClient } from '@prisma/client'
import { faker } from "@faker-js/faker";
import moment from "moment";

const prisma = new PrismaClient();

async function seed() {
  try {
    // 1. Create a Merchant
    const merchant = await prisma.merchant.create({
      data: {}, // No specific data needed on creation
    });

    // 2. Create some Customers
    const numCustomers = 3;
    const customers: any = [];
    for (let i = 0; i < numCustomers; i++) {
      const customer = await prisma.customer.create({
        data: {
          name: faker.person.fullName(),
        },
      });
      customers.push(customer);
    }

    // 3. Create Payments (Generate data for the last 6 months)
    const numPaymentsPerCustomer = 5; //payments per customer per month
    for (let i = 0; i < 6; i++) {
      // Last 6 months
      const monthStart = moment()
        .subtract(i, "months")
        .startOf("month")
        .toDate();
      const monthEnd = moment().subtract(i, "months").endOf("month").toDate();

      for (const customer of customers) {
        for (let j = 0; j < numPaymentsPerCustomer; j++) {
          const paymentDate = faker.date.between({
            from: monthStart,
            to: monthEnd,
          });
          const paymentAmount = faker.number.float({
            min: 50,
            max: 200,
          });

          await prisma.payment.create({
            data: {
              customerId: customer.id,
              merchantId: merchant.id,
              paymentAmount: paymentAmount,
              paymentDate: paymentDate,
            },
          });
        }
      }
    }

    // 4. Create Expenses (Generate data for the last 6 months)
    const numExpensesPerMonth = 3;
    for (let i = 0; i < 6; i++) {
      const monthStart = moment()
        .subtract(i, "months")
        .startOf("month")
        .toDate();
      const monthEnd = moment().subtract(i, "months").endOf("month").toDate();

      for (let j = 0; j < numExpensesPerMonth; j++) {
        const expenseDate = faker.date.between({
          from: monthStart,
          to: monthEnd,
        });
        const expenseAmount = faker.number.float({
          min: 20,
          max: 100,
          fractionDigits: 2,
        });

        await prisma.expense.create({
          data: {
            merchantId: merchant.id,
            expenseAmount: expenseAmount,
            expenseDate: expenseDate,
          },
        });
      }
    }

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding the database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();

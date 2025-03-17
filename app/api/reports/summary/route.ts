import { prisma } from "@/db/prisma";
import { Decimal } from "@prisma/client/runtime/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const merchantId = searchParams.get("merchantId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!merchantId) {
      return NextResponse.json(
        { error: "Merchant ID is required" },
        { status: 400 }
      );
    }
    const merchantIdInt = parseInt(merchantId as string, 10);

    const paymentWhereClause = {
      merchantId: merchantIdInt,
      paymentDate: {
        gte: startDate ? new Date(startDate as string) : undefined,
        lte: endDate ? new Date(endDate as string) : undefined,
      },
    };

    const expenseWhereClause = {
      merchantId: merchantIdInt,
      expenseDate: {
        gte: startDate ? new Date(startDate as string) : undefined,
        lte: endDate ? new Date(endDate as string) : undefined,
      },
    };

    const totalRevenueResult = await prisma.payment.aggregate({
      where: paymentWhereClause,
      _sum: {
        paymentAmount: true,
      },
    });

    // Convert Decimal to Number and round
    const totalRevenueDecimal = totalRevenueResult._sum.paymentAmount || new Decimal(0);
    const totalRevenue = parseFloat(totalRevenueDecimal.toFixed(2)); // Round to 2 decimal places

    const totalExpensesResult = await prisma.expense.aggregate({
      where: expenseWhereClause,
      _sum: {
        expenseAmount: true,
      },
    });

    const totalExpensesDecimal = totalExpensesResult._sum.expenseAmount || new Decimal(0);
    const totalExpenses = parseFloat(totalExpensesDecimal.toFixed(2)); // Round to 2 decimal places


    const netProfitDecimal = totalRevenueDecimal.minus(totalExpensesDecimal);
    const netProfit = parseFloat(netProfitDecimal.toFixed(2)); // Round to 2 decimal places

    //Rounding off the number of customers instead of parsing
    const totalCustomers = Math.round(await prisma.payment.count({
      where: {
        merchantId: merchantIdInt,
      },
    }));

    return NextResponse.json({
      totalRevenue,
      totalExpenses,
      netProfit,
      totalCustomers,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching report summary " + error },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
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

    const totalRevenue = totalRevenueResult._sum.paymentAmount || new Decimal(0);

    const totalExpensesResult = await prisma.expense.aggregate({
      where: expenseWhereClause,
      _sum: {
        expenseAmount: true,
      },
    });

    const totalExpenses =
      totalExpensesResult._sum.expenseAmount || new Decimal(0);

    const netProfit = totalRevenue.minus(totalExpenses);

    const totalCustomers = await prisma.payment.count({
      where: {
        merchantId: merchantIdInt,
      },
    });

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

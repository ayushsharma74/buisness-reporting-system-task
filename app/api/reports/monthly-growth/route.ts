import { Decimal } from "@prisma/client/runtime/library.js";
import { NextRequest, NextResponse } from "next/server";
import moment from "moment";
import { prisma } from "@/db/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const merchantId = searchParams.get("merchantId");

    if (!merchantId) {
      return NextResponse.json(
        { error: "Merchant ID is required" },
        { status: 400 }
      );
    }
    const merchantIdInt = parseInt(merchantId as string, 10);

    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = moment()
        .subtract(i, "months")
        .startOf("month")
        .toDate();
      const monthEnd = moment().subtract(i, "months").endOf("month").toDate();

      const revenueResult = await prisma.payment.aggregate({
        where: {
          merchantId: merchantIdInt,
          paymentDate: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: {
          paymentAmount: true,
        },
      });

      const revenue = revenueResult._sum.paymentAmount || new Decimal(0);

      monthlyData.push({
        month: moment(monthStart).format("MMM"),
        revenue: revenue.toNumber(),
      });
    }

    return NextResponse.json(monthlyData, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch monthly growth data" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

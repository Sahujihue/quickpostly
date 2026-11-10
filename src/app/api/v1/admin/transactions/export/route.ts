import { NextResponse } from 'next/server';
import { PaymentRepository } from '@/lib/payments/repository';

export async function GET() {
  try {
    const csvContent = PaymentRepository.exportTransactionsCsv();
    const filename = `socialhive_transactions_${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to export CSV';
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}

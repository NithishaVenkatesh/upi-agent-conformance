'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Filter, Download } from 'lucide-react';
import { fetchPayments } from '@/lib/api';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const loadPayments = async () => {
      try {
        const data = await fetchPayments();
        setPayments(data);
      } catch (error) {
        console.error('Failed to load payments:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, []);

  const filteredPayments = filterStatus === 'all'
    ? payments
    : payments.filter(p => p.status === filterStatus);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Payment History</h1>
          <p className="text-gray-600 mt-2">All transactions with regulatory compliance verification</p>
        </div>

        {/* Controls */}
        <div className="flex gap-4 mb-8">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-gray-400"
          >
            <option value="all">All Payments</option>
            <option value="completed">✅ Completed</option>
            <option value="refused">❌ Refused</option>
            <option value="pending">⏳ Pending</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {/* Payments Table */}
        <Card className="bg-white border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              {filteredPayments.length} Payment{filteredPayments.length !== 1 ? 's' : ''}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-gray-500">Loading payments...</p>
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-gray-500">No payments found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Order ID</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Amount</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Method</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Conformance</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Timestamp</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((payment) => (
                      <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6 text-sm font-mono text-gray-900">{payment.id.slice(0, 15)}...</td>
                        <td className="py-4 px-6 text-sm font-semibold text-gray-900">₹{payment.amount.toLocaleString()}</td>
                        <td className="py-4 px-6 text-sm text-gray-600">{payment.method.toUpperCase()}</td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              payment.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : payment.status === 'refused'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {payment.status === 'completed' ? '✅' : payment.status === 'refused' ? '❌' : '⏳'} {payment.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              payment.conformance_status === 'VERIFIED'
                                ? 'bg-blue-100 text-blue-800'
                                : payment.conformance_status === 'FAILED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {payment.conformance_status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-500">
                          {new Date(payment.timestamp).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6">
                          <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Refusal Details */}
        {payments.some(p => p.status === 'refused' && p.refusal_clause) && (
          <Card className="bg-white border-0 shadow-lg mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                Refused Transactions Details
              </CardTitle>
              <CardDescription>Regulatory citations for each refusal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {payments
                .filter(p => p.status === 'refused' && p.refusal_clause)
                .map((payment) => (
                  <div key={payment.id} className="border border-amber-200 bg-amber-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{payment.refusal_reason}</h4>
                      <span className="text-sm text-amber-700">₹{payment.amount.toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-amber-800 font-mono mb-2">{payment.refusal_clause}</p>
                    <p className="text-sm text-gray-600">
                      This transaction was refused because it violates the regulatory requirement specified above.
                      The merchant should review their terms and adjust to comply with the regulation.
                    </p>
                  </div>
                ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

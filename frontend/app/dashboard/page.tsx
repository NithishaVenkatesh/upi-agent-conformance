'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertCircle, CheckCircle, TrendingDown, DollarSign, Shield, AlertTriangle, Calendar, Eye } from 'lucide-react';
import { fetchComplianceMetrics, fetchPayments, fetchViolations } from '@/lib/api';

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [payments, setPayments] = useState([]);
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [metricsData, paymentsData, violationsData] = await Promise.all([
          fetchComplianceMetrics(),
          fetchPayments(),
          fetchViolations()
        ]);
        setMetrics(metricsData);
        setPayments(paymentsData);
        setViolations(violationsData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading || !metrics) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const complianceData = [
    { name: 'Compliant', value: metrics.score },
    { name: 'At Risk', value: 100 - metrics.score }
  ];

  const volumeData = [
    { month: 'Week 1', successful: 112000, blocked: 0 },
    { month: 'Week 2', successful: 98000, blocked: 0 },
    { month: 'Week 3', successful: 142350, blocked: 0 },
    { month: 'Week 4', successful: 100000, blocked: 0 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Compliance Dashboard</h1>
          <p className="text-gray-600 mt-2">Real-time regulatory compliance monitoring</p>
        </div>

        {/* Main Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Compliance Score */}
          <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Compliance Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-4xl font-bold text-green-600">{metrics.score}%</div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${metrics.score}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">{metrics.status === 'healthy' ? '✅ Healthy' : '⚠️ At Risk'}</p>
            </CardContent>
          </Card>

          {/* Days Since Violation */}
          <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Days Since Violation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-4xl font-bold text-blue-600">{metrics.days_since_violation}</div>
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-sm text-gray-500 mt-2">Clean record maintained</p>
            </CardContent>
          </Card>

          {/* Violations This Month */}
          <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Violations This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-4xl font-bold text-emerald-600">{metrics.violations_this_month}</div>
                <Shield className="w-8 h-8 text-emerald-500" />
              </div>
              <p className="text-sm text-gray-500 mt-2">No compliance issues</p>
            </CardContent>
          </Card>

          {/* Payment Volume */}
          <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Payment Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold text-purple-600">₹{(metrics.payment_volume / 100000).toFixed(1)}L</div>
                <DollarSign className="w-8 h-8 text-purple-500" />
              </div>
              <p className="text-sm text-gray-500 mt-2">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Payment Volume Chart */}
          <Card className="bg-white border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Payment Volume Trend</CardTitle>
              <CardDescription>Successful vs Blocked Payments</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={volumeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value / 1000}k`} />
                  <Bar dataKey="successful" fill="#10b981" name="Successful" />
                  <Bar dataKey="blocked" fill="#ef4444" name="Blocked" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Compliance Score Gauge */}
          <Card className="bg-white border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Compliance Status</CardTitle>
              <CardDescription>Current regulatory alignment</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={complianceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#f3f4f6" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Violations */}
        <div className="grid grid-cols-1 gap-6">
          <Card className="bg-white border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Recent Violations
              </CardTitle>
              <CardDescription>Compliance issues detected and prevented</CardDescription>
            </CardHeader>
            <CardContent>
              {violations.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="text-gray-600">No violations in the last 30 days</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {violations.map((violation) => (
                    <div
                      key={violation.id}
                      className="border border-amber-200 bg-amber-50 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{violation.type}</h4>
                          <p className="text-sm text-gray-600 mt-1">{violation.details}</p>
                          <div className="mt-2 text-xs text-gray-500">
                            <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded">
                              {violation.clause}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-red-600">₹{violation.amount.toLocaleString()}</div>
                          <div className="text-xs text-gray-500 mt-1">{new Date(violation.timestamp).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Payments */}
          <Card className="bg-white border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-500" />
                Recent Payments
              </CardTitle>
              <CardDescription>Payment processing with compliance verification</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Order ID</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Compliance</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-mono text-gray-900">{payment.id.slice(0, 20)}...</td>
                        <td className="py-3 px-4 text-sm font-semibold text-gray-900">₹{payment.amount.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              payment.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {payment.status === 'completed' ? '✅ Completed' : '❌ Refused'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              payment.conformance_status === 'VERIFIED'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {payment.conformance_status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {new Date(payment.timestamp).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

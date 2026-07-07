import React from 'react';
import { Activity, TrendingUp, Calendar, DollarSign, Car } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface Rule {
  id: string;
  name: string;
  status: string;
  fleetTypes: string[];
  revenueImpact: string;
  executionCount: number;
}

interface RuleDashboardProps {
  rules: Rule[];
}

export function RuleDashboard({ rules }: RuleDashboardProps) {
  const activeRules = rules.filter(r => r.status === 'active').length;
  const scheduledRules = rules.filter(r => r.status === 'scheduled').length;
  const totalExecutions = rules.reduce((sum, r) => sum + r.executionCount, 0);
  
  // Calculate total revenue impact
  const totalRevenue = rules.reduce((sum, r) => {
    const impact = parseInt(r.revenueImpact.replace(/[^0-9-]/g, '')) || 0;
    return sum + impact;
  }, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-gray-600">Active Rules</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-gray-900">{activeRules}</div>
            <p className="text-xs text-gray-500 mt-1">Currently executing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-gray-600">Scheduled Rules</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-gray-900">{scheduledRules}</div>
            <p className="text-xs text-gray-500 mt-1">Waiting to execute</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-gray-600">Total Executions</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-gray-900">{totalExecutions}</div>
            <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-gray-600">Revenue Impact</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-gray-900">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-green-600 mt-1">+12.4% vs baseline</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Rules Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Active Rules Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rules.filter(r => r.status === 'active').map(rule => (
              <div key={rule.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Activity className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-gray-900">{rule.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Fleet: {rule.fleetTypes.join(', ')}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-gray-500">
                        Executions: {rule.executionCount}
                      </span>
                      <span className="text-xs text-green-600">
                        Impact: {rule.revenueImpact}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                    Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fleet Type Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Fleet Type Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { type: 'Luxury & Sports', rules: 3, impact: '+$15,200', color: 'purple' },
              { type: 'SUV & XUV', rules: 2, impact: '+$8,900', color: 'blue' },
              { type: 'Sedan & Compact', rules: 4, impact: '+$12,100', color: 'green' }
            ].map((fleet, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Car className={`h-4 w-4 text-${fleet.color}-600`} />
                  <h4 className="text-sm text-gray-900">{fleet.type}</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Active Rules:</span>
                    <span className="text-gray-900">{fleet.rules}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Revenue Impact:</span>
                    <span className="text-green-600">{fleet.impact}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-1 h-full bg-blue-600 rounded"></div>
              <div>
                <p className="text-sm text-gray-900">Weekend Premium Surge is your top performer</p>
                <p className="text-xs text-gray-500 mt-1">Generated +$12,450 in additional revenue</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
              <div className="w-1 h-full bg-amber-600 rounded"></div>
              <div>
                <p className="text-sm text-gray-900">Consider activating your scheduled SUV rule</p>
                <p className="text-xs text-gray-500 mt-1">Competitor prices are currently 8% higher</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-1 h-full bg-green-600 rounded"></div>
              <div>
                <p className="text-sm text-gray-900">All active rules are executing successfully</p>
                <p className="text-xs text-gray-500 mt-1">No errors in the last 24 hours</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

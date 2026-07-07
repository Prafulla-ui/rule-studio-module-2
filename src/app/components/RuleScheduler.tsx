import React, { useState } from 'react';
import { Calendar, Clock, Play, Pause } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface Rule {
  id: string;
  name: string;
  status: string;
  fleetTypes: string[];
  schedule: string;
}

interface RuleSchedulerProps {
  rules: Rule[];
}

export function RuleScheduler({ rules }: RuleSchedulerProps) {
  const [selectedDay, setSelectedDay] = useState<number>(0);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const activeRules = rules.filter(r => r.status === 'active');

  const getRulesForDay = (day: string) => {
    return activeRules.filter(rule => 
      rule.schedule.toLowerCase().includes(day.substring(0, 3).toLowerCase()) ||
      rule.schedule.toLowerCase().includes('daily')
    );
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let i = 0; i < 24; i++) {
      slots.push(`${i.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  return (
    <div className="space-y-6">
      {/* Calendar View */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Rule Schedule Calendar</CardTitle>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-600">Week View</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-6">
            {daysOfWeek.map((day, index) => {
              const dayRules = getRulesForDay(day);
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(index)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedDay === index
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-sm text-gray-900">{day.slice(0, 3)}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {dayRules.length} {dayRules.length === 1 ? 'rule' : 'rules'}
                  </div>
                  {dayRules.length > 0 && (
                    <div className="mt-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Day Details */}
          <div className="space-y-4">
            <h3 className="text-gray-900">{daysOfWeek[selectedDay]} Schedule</h3>
            
            {getRulesForDay(daysOfWeek[selectedDay]).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No rules scheduled for this day
              </div>
            ) : (
              <div className="space-y-3">
                {getRulesForDay(daysOfWeek[selectedDay]).map(rule => (
                  <div key={rule.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-gray-900">{rule.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Fleet: {rule.fleetTypes.join(', ')}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{rule.schedule}</span>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                        {rule.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timeline View */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Timeline - {daysOfWeek[selectedDay]}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {getTimeSlots().map(time => {
              const hour = parseInt(time.split(':')[0]);
              const rulesAtTime = getRulesForDay(daysOfWeek[selectedDay]).filter(rule => {
                const scheduleMatch = rule.schedule.match(/(\d+):(\d+)\s*[AP]M/);
                if (scheduleMatch) {
                  let scheduleHour = parseInt(scheduleMatch[1]);
                  const period = rule.schedule.includes('PM') ? 'PM' : 'AM';
                  if (period === 'PM' && scheduleHour !== 12) scheduleHour += 12;
                  if (period === 'AM' && scheduleHour === 12) scheduleHour = 0;
                  return scheduleHour === hour;
                }
                return false;
              });

              return (
                <div key={time} className="flex items-center gap-4">
                  <div className="w-16 text-sm text-gray-500">{time}</div>
                  <div className="flex-1 h-12 border border-gray-200 rounded relative overflow-hidden">
                    {rulesAtTime.length > 0 && (
                      <div className="absolute inset-0 bg-blue-100 border-l-4 border-blue-600 flex items-center px-3">
                        <span className="text-sm text-blue-900">
                          {rulesAtTime.map(r => r.name).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Executions */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Rule Executions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeRules.slice(0, 5).map((rule, index) => (
              <div key={rule.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Play className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-900">{rule.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">{rule.schedule}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-900">Next in</p>
                  <p className="text-xs text-gray-500">{2 + index}h {15 + index * 10}m</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

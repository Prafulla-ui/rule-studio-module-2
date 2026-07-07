import { useState } from 'react';
import { RuleDashboard } from './components/RuleDashboard';
import { RuleCreator } from './components/RuleCreator';
import { ScheduleCreator } from './components/ScheduleCreator';
import { SchedulerCreator } from './components/SchedulerCreator';
import { RuleList } from './components/RuleList';
import { RuleScheduler } from './components/RuleScheduler';
import { RuleEditDrawer } from './components/RuleEditDrawer';
import { Login } from './components/Login';
import { Header } from './components/Header';
import { DaysOutDesignOptions } from './components/DaysOutDesignOptions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Plus } from 'lucide-react';
import { toast, Toaster } from 'sonner@2.0.3';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [rules, setRules] = useState(sampleRules);
  const [schedulers, setSchedulers] = useState([]);
  const [showCreator, setShowCreator] = useState(false);
  const [showScheduleCreator, setShowScheduleCreator] = useState(false);
  const [showSchedulerCreator, setShowSchedulerCreator] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);

  const handleDeleteRule = (ruleId: string) => {
    setRules(rules.filter(rule => rule.id !== ruleId));
  };

  const handleUpdateRuleStatus = (ruleId: string, status: string) => {
    setRules(rules.map(rule => 
      rule.id === ruleId ? { ...rule, status } : rule
    ));
  };

  const handleUpdateRule = (ruleId: string, updatedRule: any) => {
    setRules(rules.map(rule => 
      rule.id === ruleId ? { ...rule, ...updatedRule } : rule
    ));
  };

  const handleCreateRule = (newRule: any) => {
    if (editingRule) {
      // Update existing rule
      handleUpdateRule(editingRule.id, newRule);
      setEditingRule(null);
      toast.success('Rule updated successfully!', {
        description: `"${newRule.name}" has been updated.`,
        duration: 4000,
      });
    } else {
      // Create new rule
      // Determine status based on whether rule has schedule data
      const hasSchedule = newRule.schedule && newRule.schedule !== 'Not scheduled';
      const rule = {
        ...newRule,
        id: String(rules.length + 1),
        status: hasSchedule ? 'scheduled' : 'draft',
        createdDate: new Date().toISOString().split('T')[0],
        lastExecuted: null,
        executionCount: 0,
        revenueImpact: '$0'
      };
      setRules([...rules, rule]);
      
      if (hasSchedule) {
        toast.success('Rule created and scheduled!', {
          description: `"${newRule.name}" is now ${rule.status}.`,
          duration: 4000,
        });
      } else {
        toast.success('Rule saved as draft!', {
          description: `"${newRule.name}" has been saved. Click "Schedule Rule" to activate it.`,
          duration: 5000,
        });
      }
    }
    setShowCreator(false);
  };

  const handleEditRule = (rule: any) => {
    setEditingRule(rule);
    setShowCreator(true);
  };

  const handleOpenEditDrawer = (rule: any) => {
    setEditingRule(rule);
    setEditDrawerOpen(true);
  };

  const handleCreateSchedule = (scheduleData: any) => {
    // Find the rule and update it with schedule information
    const ruleId = scheduleData.ruleId;
    const updatedRule = {
      schedule: scheduleData.schedule,
      status: 'scheduled'
    };
    
    handleUpdateRule(ruleId, updatedRule);
    setShowScheduleCreator(false);
    
    toast.success('Strategy created successfully!', {
      description: `\"${scheduleData.ruleName}\" has been scheduled.`,
      duration: 4000,
    });
  };

  const handleCreateScheduler = (schedulerData: any) => {
    const newScheduler = {
      ...schedulerData,
      id: String(schedulers.length + 1),
      createdDate: new Date().toISOString().split('T')[0],
      creationSource: schedulerData.creationSource ?? 'manual',
      importStatus: schedulerData.importStatus ?? null,
      importValidationErrors: schedulerData.importValidationErrors ?? [],
    };

    setSchedulers([...schedulers, newScheduler]);
    setShowSchedulerCreator(false);

    toast.success('Scheduler created successfully!', {
      description: `"${schedulerData.scheduleName}" has been saved.`,
      duration: 4000,
    });
  };

  const handleImportSchedulers = (importedSchedulers: any[], summary: { created: number; needsAttention: number }) => {
    const startIndex = schedulers.length;
    const withIds = importedSchedulers.map((scheduler, index) => ({
      ...scheduler,
      id: scheduler.id ?? String(startIndex + index + 1),
      createdDate: scheduler.createdDate ?? new Date().toISOString().split('T')[0],
    }));

    setSchedulers([...schedulers, ...withIds]);
    setShowSchedulerCreator(false);

    const attentionNote = summary.needsAttention > 0
      ? ` ${summary.needsAttention} need attention.`
      : '';
    toast.success(`${summary.created} scheduler(s) imported.${attentionNote}`, {
      description: summary.needsAttention > 0
        ? 'Review flagged records in the scheduler list.'
        : 'All imported schedulers are complete.',
      duration: 5000,
    });
  };

  const handleUpdateScheduler = (updatedScheduler: any, options?: { skipToast?: boolean }) => {
    setSchedulers(schedulers.map(scheduler => 
      scheduler.id === updatedScheduler.id ? updatedScheduler : scheduler
    ));
    if (!options?.skipToast) {
      toast.success('Scheduler updated successfully!', {
        description: `"${updatedScheduler.scheduleName}" has been updated.`,
        duration: 4000,
      });
    }
  };

  const handleDeleteScheduler = (schedulerId: string) => {
    setSchedulers(schedulers.filter(scheduler => scheduler.id !== schedulerId));
  };

  const handleBulkUpdateSchedulers = (schedulerIds: string[], updates: Record<string, any>) => {
    setSchedulers(schedulers.map(scheduler =>
      schedulerIds.includes(scheduler.id) ? { ...scheduler, ...updates } : scheduler
    ));
    toast.success(`Updated ${schedulerIds.length} scheduler(s)`);
  };

  const handleBulkDeleteSchedulers = (schedulerIds: string[]) => {
    setSchedulers(schedulers.filter(scheduler => !schedulerIds.includes(scheduler.id)));
    toast.success(`Deleted ${schedulerIds.length} scheduler(s)`);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    toast.success('Welcome to CARGAIN!', {
      description: 'You have successfully logged in.',
      duration: 3000,
    });
  };

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />
      <main className="max-w-[1400px] mx-auto px-6 py-6">
        {showSchedulerCreator ? (
          <SchedulerCreator
            onCancel={() => setShowSchedulerCreator(false)}
            onSave={handleCreateScheduler}
            onImportSave={handleImportSchedulers}
            existingSchedulers={schedulers}
          />
        ) : showScheduleCreator ? (
          <ScheduleCreator
            onCancel={() => setShowScheduleCreator(false)}
            onSave={handleCreateSchedule}
            rules={rules}
          />
        ) : !showCreator ? (
          <RuleList 
            rules={rules}
            schedulers={schedulers}
            onUpdateStatus={handleUpdateRuleStatus}
            onDelete={handleDeleteRule}
            onUpdateRule={handleUpdateRule}
            onEdit={handleEditRule}
            onCreateRule={() => setShowCreator(true)}
            onCreateSchedule={() => setShowScheduleCreator(true)}
            onCreateScheduler={() => setShowSchedulerCreator(true)}
            onUpdateScheduler={handleUpdateScheduler}
            onDeleteScheduler={handleDeleteScheduler}
            onBulkUpdateSchedulers={handleBulkUpdateSchedulers}
            onBulkDeleteSchedulers={handleBulkDeleteSchedulers}
          />
        ) : (
          <RuleCreator 
            onCancel={() => {
              setShowCreator(false);
              setEditingRule(null);
            }}
            onSave={handleCreateRule}
            editingRule={editingRule}
          />
        )}
      </main>
      <Toaster 
        position="top-right" 
        richColors 
        expand={true}
        toastOptions={{
          style: {
            padding: '16px',
            fontSize: '15px',
          },
          className: 'toast-custom',
        }}
      />
    </div>
  );
}

const sampleRules = [
  {
    id: '1',
    name: 'Weekend Premium Surge',
    status: 'scheduled',
    fleetTypes: ['Luxury', 'Sports'],
    location: 'LAS-LAS',
    productType: 'Premium',
    condition: 'If Weekend days',
    action: 'If Utilization > 70% Then Current Price',
    schedule: 'Fri, Sat, Sun 18:00 - 23:00',
    createdDate: '2025-10-15',
    lastExecuted: '2025-11-08',
    executionCount: 24,
    revenueImpact: '+$12,450',
    scheduleCount: 3,
    scheduleNames: ['Weekend Premium Pricing', 'Friday Night Special', 'Luxury Weekend Surge']
  },
  {
    id: '2',
    name: 'Weekday Economy Boost',
    status: 'scheduled',
    fleetTypes: ['Sedan', 'Compact'],
    location: 'Los Angeles',
    productType: 'Economy',
    condition: 'If Weekday',
    action: 'If Utilization < 50% Then Value',
    schedule: 'Mon, Tue, Wed, Thu 09:00 - 17:00',
    createdDate: '2025-10-20',
    lastExecuted: '2025-11-07',
    executionCount: 18,
    revenueImpact: '+$8,200',
    scheduleCount: 7,
    scheduleNames: ['Weekday Discount', 'Monday Morning Deal', 'Tuesday Boost', 'Wednesday Value', 'Thursday Special', 'Midweek Saver', 'Business Week Pricing']
  },
  {
    id: '3',
    name: 'Competitor Match - SUV',
    status: 'scheduled',
    fleetTypes: ['SUV', 'XUV'],
    location: 'Chicago',
    productType: 'Standard',
    condition: 'If Competitor price < Our price',
    action: 'If Utilization Less than 60% And Days out Less than 5 day Then Current Price',
    schedule: 'Mon, Tue, Wed, Thu, Fri, Sat, Sun 06:00 - 06:00',
    createdDate: '2025-11-01',
    lastExecuted: null,
    executionCount: 0,
    revenueImpact: '$0',
    scheduleCount: 2,
    scheduleNames: ['Mag 7 Match', 'Competitor Price Sync']
  },
  {
    id: '4',
    name: 'Holiday Peak Pricing',
    status: 'draft',
    fleetTypes: ['All Fleet Types'],
    location: 'Miami',
    productType: 'Luxury',
    condition: 'If Major holidays',
    action: 'If Utilization > 80% And Days out Greater than 7 day Then Current Price',
    schedule: 'Specific dates only',
    createdDate: '2025-09-10',
    lastExecuted: '2025-10-31',
    executionCount: 5,
    revenueImpact: '+$18,900',
    scheduleCount: 0
  },
  {
    id: '5',
    name: 'Early Bird Discount',
    status: 'draft',
    fleetTypes: ['Compact', 'Sedan'],
    location: 'San Francisco',
    productType: 'Economy',
    condition: 'If Booking made',
    action: 'If Utilization Less than 50% And Days out Greater than 14 day Then Value',
    schedule: '',
    createdDate: '2025-11-09',
    lastExecuted: null,
    executionCount: 0,
    revenueImpact: '$0',
    scheduleCount: 0
  },
  {
    id: '6',
    name: 'Airport Rush Hour Premium',
    status: 'scheduled',
    fleetTypes: ['Sedan', 'SUV'],
    location: 'New York',
    productType: 'Premium',
    condition: 'If Airport location And Pickup time 06:00-10:00',
    action: 'If Utilization Greater than 65% Then Current Price',
    schedule: 'Mon, Tue, Wed, Thu, Fri 06:00 - 10:00',
    createdDate: '2025-10-05',
    lastExecuted: '2025-11-09',
    executionCount: 45,
    revenueImpact: '+$15,800',
    scheduleCount: 4,
    scheduleNames: ['Morning Rush', 'Evening Peak', 'Airport Premium Hours', 'JFK Rush Pricing']
  },
  {
    id: '7',
    name: 'Monthly Subscriber Discount',
    status: 'scheduled',
    fleetTypes: ['Compact', 'Sedan', 'SUV'],
    location: 'LAS-LAS',
    productType: 'Standard',
    condition: 'If Customer type = Subscriber',
    action: 'If Utilization Less than 70% Then Value',
    schedule: 'Always Active',
    createdDate: '2025-09-25',
    lastExecuted: '2025-11-09',
    executionCount: 156,
    revenueImpact: '+$22,300',
    scheduleCount: 1,
    scheduleNames: ['Monthly Subscriber Deal']
  },
  {
    id: '8',
    name: 'Last Minute Booking Surge',
    status: 'scheduled',
    fleetTypes: ['All Fleet Types'],
    location: 'Los Angeles',
    productType: 'Premium',
    condition: 'If Last minute booking',
    action: 'If Utilization Greater than 50% And Days out Less than 1 day Then Current Price',
    schedule: 'Always Active',
    createdDate: '2025-10-12',
    lastExecuted: '2025-11-08',
    executionCount: 89,
    revenueImpact: '+$28,500',
    scheduleCount: 1,
    scheduleNames: ['Same Day Surge Pricing']
  },
  {
    id: '9',
    name: 'Low Season Promotion',
    status: 'scheduled',
    fleetTypes: ['Luxury', 'Sports'],
    location: 'Miami',
    productType: 'Luxury',
    condition: 'If Season = Low And Weekday',
    action: 'If Utilization Less than 40% Then Value',
    schedule: 'Mon, Tue, Wed 10:00 - 16:00',
    createdDate: '2025-11-02',
    lastExecuted: null,
    executionCount: 0,
    revenueImpact: '$0',
    scheduleCount: 2,
    scheduleNames: ['Off Season Deal', 'Winter Weekday Special']
  },
  {
    id: '10',
    name: 'Extended Rental Discount',
    status: 'draft',
    fleetTypes: ['All Fleet Types'],
    location: 'Chicago',
    productType: 'Economy',
    condition: 'If Length of rental > 7 days',
    action: 'If Utilization Less than 55% And Days out Greater than 3 day Then Value',
    schedule: '',
    createdDate: '2025-11-08',
    lastExecuted: null,
    executionCount: 0,
    revenueImpact: '$0',
    scheduleCount: 0
  },
  {
    id: '11',
    name: 'Business Traveler Premium',
    status: 'scheduled',
    fleetTypes: ['Sedan', 'Luxury'],
    location: 'San Francisco',
    productType: 'Premium',
    condition: 'If Customer type = Business And Weekday',
    action: 'If Utilization Greater than 60% Then Current Price',
    schedule: 'Mon, Tue, Wed, Thu, Fri 08:00 - 18:00',
    createdDate: '2025-10-18',
    lastExecuted: '2025-11-09',
    executionCount: 67,
    revenueImpact: '+$19,200',
    scheduleCount: 1,
    scheduleNames: ['Corporate Travel Pricing']
  },
  {
    id: '12',
    name: 'Rainy Day SUV Surge',
    status: 'scheduled',
    fleetTypes: ['SUV', 'XUV'],
    location: 'Seattle',
    productType: 'Standard',
    condition: 'If Weather = Rain Or Storm',
    action: 'If Utilization Greater than 55% And Days out Less than 3 day Then Current Price',
    schedule: 'Always Active',
    createdDate: '2025-09-15',
    lastExecuted: '2025-11-08',
    executionCount: 112,
    revenueImpact: '+$24,600',
    scheduleCount: 1,
    scheduleNames: ['Weather-Based SUV Premium']
  },
  {
    id: '13',
    name: 'Summer Beach Weekend',
    status: 'scheduled',
    fleetTypes: ['Sports', 'Convertible'],
    location: 'Miami',
    productType: 'Luxury',
    condition: 'If Season = Summer And Weekend',
    action: 'If Utilization Greater than 70% Then Current Price',
    schedule: 'Sat, Sun 00:00 - 23:59',
    createdDate: '2025-11-05',
    lastExecuted: null,
    executionCount: 0,
    revenueImpact: '$0',
    scheduleCount: 2,
    scheduleNames: ['Saturday Beach Rush', 'Sunday Coastal Premium']
  },
  {
    id: '14',
    name: 'Compact Commuter Deal',
    status: 'scheduled',
    fleetTypes: ['Compact'],
    location: 'Boston',
    productType: 'Economy',
    condition: 'If Weekday morning hours',
    action: 'If Utilization Less than 60% And Days out Less than 2 day Then Value',
    schedule: 'Mon, Tue, Wed, Thu, Fri 06:00 - 09:00',
    createdDate: '2025-10-22',
    lastExecuted: '2025-11-09',
    executionCount: 34,
    revenueImpact: '+$6,800',
    scheduleCount: 1,
    scheduleNames: ['Morning Commute Special']
  },
  {
    id: '15',
    name: 'Convention Center Surge',
    status: 'draft',
    fleetTypes: ['Sedan', 'SUV', 'Luxury'],
    location: 'LAS-LAS',
    productType: 'Premium',
    condition: 'If Major event at convention center',
    action: 'If Utilization Greater than 75% Then Current Price',
    schedule: 'Event-based',
    createdDate: '2025-09-28',
    lastExecuted: '2025-10-25',
    executionCount: 8,
    revenueImpact: '+$31,400',
    scheduleCount: 0
  },
  {
    id: '16',
    name: 'Loyalty Member Reward',
    status: 'scheduled',
    fleetTypes: ['All Fleet Types'],
    location: 'New York',
    productType: 'Standard',
    condition: 'If Customer loyalty tier = Gold Or Platinum',
    action: 'If Utilization Less than 65% Then Value',
    schedule: 'Always Active',
    createdDate: '2025-09-01',
    lastExecuted: '2025-11-09',
    executionCount: 203,
    revenueImpact: '+$35,700',
    scheduleCount: 1,
    scheduleNames: ['Premium Member Benefits']
  },
  {
    id: '17',
    name: 'Red Eye Flight Special',
    status: 'scheduled',
    fleetTypes: ['Sedan', 'Compact'],
    location: 'Los Angeles',
    productType: 'Standard',
    condition: 'If Pickup time between 00:00-05:00',
    action: 'If Utilization Less than 50% And Days out Less than 4 day Then Value',
    schedule: 'Mon, Tue, Wed, Thu, Fri, Sat, Sun 00:00 - 05:00',
    createdDate: '2025-11-03',
    lastExecuted: null,
    executionCount: 0,
    revenueImpact: '$0',
    scheduleCount: 2,
    scheduleNames: ['Late Night Arrival Deal', 'Early Morning Special']
  },
  {
    id: '18',
    name: 'Sports Event Premium',
    status: 'draft',
    fleetTypes: ['All Fleet Types'],
    location: 'Chicago',
    productType: 'Premium',
    condition: 'If Major sports event scheduled',
    action: 'If Utilization Greater than 70% And Days out Greater than 5 day Then Current Price',
    schedule: '',
    createdDate: '2025-11-07',
    lastExecuted: null,
    executionCount: 0,
    revenueImpact: '$0',
    scheduleCount: 0
  },
  {
    id: '19',
    name: 'Midweek Luxury Promotion',
    status: 'scheduled',
    fleetTypes: ['Luxury', 'Sports'],
    location: 'San Francisco',
    productType: 'Luxury',
    condition: 'If Tuesday Or Wednesday',
    action: 'If Utilization Less than 55% And Days out Less than 6 day Then Value',
    schedule: 'Tue, Wed 10:00 - 20:00',
    createdDate: '2025-10-14',
    lastExecuted: '2025-11-06',
    executionCount: 28,
    revenueImpact: '+$11,300',
    scheduleCount: 1,
    scheduleNames: ['Midweek Luxury Deal']
  },
  {
    id: '20',
    name: 'Winter Storm Adjustment',
    status: 'scheduled',
    fleetTypes: ['SUV', 'XUV', '4WD'],
    location: 'Denver',
    productType: 'Standard',
    condition: 'If Weather = Snow Or Ice And Temperature < 32°F',
    action: 'If Utilization Greater than 60% And Days out Less than 3 day Then Current Price',
    schedule: 'Always Active (Seasonal)',
    createdDate: '2025-11-01',
    lastExecuted: null,
    executionCount: 0,
    revenueImpact: '$0',
    scheduleCount: 1,
    scheduleNames: ['Winter Weather Pricing']
  }
];
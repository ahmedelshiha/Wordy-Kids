import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, 
  HardDrive, 
  Trash2, 
  Zap, 
  Download, 
  Upload, 
  AlertTriangle, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';
import { useStorageHealth } from '@/hooks/useOptimizedStorage';

export const StorageHealthDashboard: React.FC = () => {
  const {
    healthReport,
    lastCheck,
    refreshHealth,
    runCleanup,
    runOptimization,
    exportData,
    importData
  } = useStorageHealth();

  const { status, issues, recommendations, stats } = healthReport;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical': return <AlertCircle className="h-5 w-5 text-red-500" />;
      default: return <Database className="h-5 w-5" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const usagePercent = (stats.totalSize / (5 * 1024 * 1024)) * 100; // 5MB limit

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importData(file).then((result: any) => {
        if (result.success) {
          alert('Data imported successfully!');
        } else {
          alert(`Import failed: ${result.error}`);
        }
      });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Database className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Storage Health Dashboard</h2>
        </div>
        <Button onClick={refreshHealth} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {/* Health Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {getStatusIcon()}
            <span>Storage Health Status</span>
            <Badge 
              variant={status === 'healthy' ? 'default' : status === 'warning' ? 'secondary' : 'destructive'}
            >
              {status.toUpperCase()}
            </Badge>
          </CardTitle>
          <CardDescription>
            Last checked: {formatDate(lastCheck)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Storage Usage */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Storage Usage</span>
              <span>{formatBytes(stats.totalSize)} / 5MB</span>
            </div>
            <Progress value={usagePercent} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {usagePercent.toFixed(1)}% of allocated storage used
            </p>
          </div>

          {/* Issues and Recommendations */}
          {issues.length > 0 && (
            <Alert variant={status === 'critical' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Issues detected:</strong>
                <ul className="mt-2 list-disc list-inside">
                  {issues.map((issue, index) => (
                    <li key={index} className="text-sm">{issue}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {recommendations.length > 0 && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Recommendations:</strong>
                <ul className="mt-2 list-disc list-inside">
                  {recommendations.map((rec, index) => (
                    <li key={index} className="text-sm">{rec}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Storage Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(stats.totalSize)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available Space</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(stats.availableSpace)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expired Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.expiredItems}</div>
          </CardContent>
        </Card>
      </div>

      {/* Management Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Storage Management</CardTitle>
          <CardDescription>
            Tools to optimize and manage your application's storage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              onClick={async () => {
                const result = await runCleanup();
                if (result.success) {
                  alert(`Cleanup completed! Removed ${result.removedCount} items.`);
                } else {
                  alert(`Cleanup failed: ${result.error}`);
                }
              }}
              className="flex items-center space-x-2"
              variant="outline"
            >
              <Trash2 className="h-4 w-4" />
              <span>Run Cleanup</span>
            </Button>

            <Button 
              onClick={async () => {
                const result = await runOptimization();
                if (result.success) {
                  alert(`Optimization completed! Processed ${result.itemsProcessed} items, reclaimed ${formatBytes(result.spaceReclaimed)}.`);
                } else {
                  alert(`Optimization failed: ${result.error}`);
                }
              }}
              className="flex items-center space-x-2"
              variant="outline"
            >
              <Zap className="h-4 w-4" />
              <span>Optimize</span>
            </Button>

            <Button 
              onClick={() => {
                const result = exportData();
                if (result.success) {
                  alert('Data exported successfully!');
                } else {
                  alert(`Export failed: ${result.error}`);
                }
              }}
              className="flex items-center space-x-2"
              variant="outline"
            >
              <Download className="h-4 w-4" />
              <span>Export Data</span>
            </Button>

            <label className="flex items-center space-x-2 cursor-pointer">
              <Button asChild variant="outline" className="flex items-center space-x-2">
                <span>
                  <Upload className="h-4 w-4" />
                  <span>Import Data</span>
                </span>
              </Button>
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Cleanup:</strong> Removes expired and low-priority items</p>
            <p><strong>Optimize:</strong> Recompresses data and reorganizes storage</p>
            <p><strong>Export:</strong> Downloads a backup of all your data</p>
            <p><strong>Import:</strong> Restores data from a backup file</p>
          </div>
        </CardContent>
      </Card>

      {/* Age Information */}
      <Card>
        <CardHeader>
          <CardTitle>Data Age Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Oldest Item</p>
              <p className="text-sm text-muted-foreground">
                {stats.oldestItem ? formatDate(stats.oldestItem) : 'No data'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Newest Item</p>
              <p className="text-sm text-muted-foreground">
                {stats.newestItem ? formatDate(stats.newestItem) : 'No data'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StorageHealthDashboard;

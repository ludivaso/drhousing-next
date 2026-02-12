import { useState } from 'react';
import { Loader2, CheckCircle2, AlertTriangle, PlayCircle, Search, Download, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { exportPropertiesToCSV } from '@/lib/csvExport';
import { Property } from '@/types';

interface FailedRow {
  wpId: string;
  title: string;
  error: string;
}

interface ScanResult {
  rowIndex: number;
  wpId: string;
  title: string;
  valid: boolean;
  issues: string[];
}

interface BatchImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  csvContent: string | null;
  csvRowCount: number;
  existingProperties: Property[];
  onComplete: () => void;
}

type ImportMode = 'add' | 'clear' | null;

const BATCH_SIZE = 10;

export function BatchImportDialog({
  open,
  onOpenChange,
  csvContent,
  csvRowCount,
  existingProperties,
  onComplete,
}: BatchImportDialogProps) {
  const { toast } = useToast();

  // Mode selection state
  const [importMode, setImportMode] = useState<ImportMode>(null);
  const [backupDone, setBackupDone] = useState(false);

  // Scan state
  const [isScanning, setIsScanning] = useState(false);
  const [scanDone, setScanDone] = useState(false);
  const [validRows, setValidRows] = useState(0);
  const [invalidRows, setInvalidRows] = useState<ScanResult[]>([]);

  // Import state
  const [importingBatch, setImportingBatch] = useState<number | null>(null);
  const [completedBatches, setCompletedBatches] = useState<Set<number>>(new Set());
  const [totalImported, setTotalImported] = useState(0);
  const [totalFailed, setTotalFailed] = useState(0);
  const [failedRows, setFailedRows] = useState<FailedRow[]>([]);
  const [autoRunning, setAutoRunning] = useState(false);
  const [importDone, setImportDone] = useState(false);

  const totalBatches = Math.ceil(csvRowCount / BATCH_SIZE);

  const resetState = () => {
    setImportMode(null);
    setBackupDone(false);
    setIsScanning(false);
    setScanDone(false);
    setValidRows(0);
    setInvalidRows([]);
    setImportingBatch(null);
    setCompletedBatches(new Set());
    setTotalImported(0);
    setTotalFailed(0);
    setFailedRows([]);
    setAutoRunning(false);
    setImportDone(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && importingBatch === null && !autoRunning) {
      resetState();
      onOpenChange(false);
    }
  };

  // Pre-scan CSV
  const handleScan = async () => {
    if (!csvContent) return;
    setIsScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke('import-properties-csv', {
        body: { csvContent, scanOnly: true },
      });
      if (error) throw error;

      setValidRows(data.validRows || 0);
      const invalids = (data.scanResults || []).filter((r: ScanResult) => !r.valid);
      setInvalidRows(invalids);
      setScanDone(true);

      if (invalids.length > 0) {
        toast({
          title: `Scan Complete`,
          description: `${data.validRows} valid, ${invalids.length} problematic rows detected — these will be skipped.`,
          variant: invalids.length > 0 ? 'destructive' : 'default',
        });
      } else {
        toast({ title: 'Scan Complete', description: `All ${data.validRows} rows are valid.` });
      }
    } catch (err: any) {
      toast({ title: 'Scan Failed', description: err.message, variant: 'destructive' });
    } finally {
      setIsScanning(false);
    }
  };

  // Import a single batch
  const importBatch = async (batchIndex: number): Promise<boolean> => {
    if (!csvContent) return false;
    setImportingBatch(batchIndex);
    try {
      const clearExisting = importMode === 'clear' && batchIndex === 0 && completedBatches.size === 0;
      const { data, error } = await supabase.functions.invoke('import-properties-csv', {
        body: {
          csvContent,
          clearExisting,
          batchStart: batchIndex * BATCH_SIZE,
          batchEnd: (batchIndex + 1) * BATCH_SIZE,
        },
      });
      if (error) throw error;

      const batchSuccess = data.totalSuccess || 0;
      const batchFailed = data.totalFailed || 0;
      setTotalImported(prev => prev + batchSuccess);
      setTotalFailed(prev => prev + batchFailed);

      // Collect failed rows from results
      if (data.results) {
        const newFailed = data.results
          .filter((r: any) => !r.success)
          .map((r: any) => ({ wpId: r.wpId, title: r.title, error: r.error || 'Unknown error' }));
        if (newFailed.length > 0) {
          setFailedRows(prev => [...prev, ...newFailed]);
        }
      }

      setCompletedBatches(prev => new Set([...prev, batchIndex]));
      return true;
    } catch (err: any) {
      toast({
        title: `Batch ${batchIndex + 1} Failed`,
        description: err.message || 'Failed to import batch.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setImportingBatch(null);
    }
  };

  // Single batch click
  const handleBatchClick = async (batchIndex: number) => {
    await importBatch(batchIndex);
    onComplete();
  };

  // Import All Batches sequentially
  const handleImportAll = async () => {
    setAutoRunning(true);
    const startBatch = completedBatches.size; // resume from where we left off

    for (let i = startBatch; i < totalBatches; i++) {
      if (completedBatches.has(i)) continue;
      const success = await importBatch(i);
      if (!success) {
        toast({
          title: 'Auto-import paused',
          description: `Stopped at batch ${i + 1}. You can retry or continue manually.`,
          variant: 'destructive',
        });
        setAutoRunning(false);
        onComplete();
        return;
      }
    }

    setAutoRunning(false);
    setImportDone(true);
    onComplete();
    toast({
      title: 'Import Complete',
      description: `All batches finished. ${totalImported} imported, ${totalFailed} failed.`,
    });
  };

  const allBatchesDone = completedBatches.size === totalBatches;
  const progressPercent = csvRowCount > 0 ? (totalImported / csvRowCount) * 100 : 0;

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {importDone ? 'Import Report' : scanDone ? 'Batch Import' : importMode ? 'CSV Import' : 'Import Mode'}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              {/* Step 1: Mode selection */}
              {!importMode && (
                <>
                  <p>
                    Your file contains <strong>{csvRowCount} listings</strong>.
                    How would you like to proceed?
                  </p>
                  {existingProperties.length > 0 && (
                    <div className="rounded-md border border-yellow-500/30 bg-yellow-500/5 p-3 space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-yellow-700 dark:text-yellow-400">
                        <ShieldAlert className="w-4 h-4" />
                        You currently have {existingProperties.length} listing(s) in the database.
                      </div>
                      <p className="text-xs text-muted-foreground">
                        If you choose "Clear & Import Fresh", all existing listings will be permanently deleted.
                        We strongly recommend downloading a backup first.
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Step 2: Pre-scan */}
              {importMode && !scanDone && (
                <>
                  <p>
                    <strong>{csvRowCount} listings</strong> will be imported
                    {importMode === 'add' ? ' alongside existing data' : ' after clearing all current listings'}.
                    To avoid timeouts, the import is split into batches of {BATCH_SIZE}.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    First, we'll scan the file to detect any problematic rows. Valid rows will be imported; 
                    problematic ones will be skipped and reported at the end.
                  </p>
                </>
              )}

              {/* Step 3: Ready to import */}
              {scanDone && !importDone && (
                <>
                  <p>
                    <strong>{validRows}</strong> valid rows ready to import
                    {invalidRows.length > 0 && (
                      <>, <strong className="text-destructive">{invalidRows.length}</strong> will be skipped</>
                    )}.
                    Click <strong>Import All Batches</strong> to process automatically, or run individual batches.
                  </p>
                  {importMode === 'clear' && (
                    <p className="text-xs text-destructive font-medium">
                      ⚠ The first batch will clear all existing properties before importing.
                    </p>
                  )}
                  {importMode === 'add' && (
                    <p className="text-xs text-muted-foreground">
                      New listings will be added to your existing {existingProperties.length} properties.
                    </p>
                  )}
                </>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <ScrollArea className="flex-1 max-h-[55vh] pr-4">
          <div className="space-y-4">
            {/* Mode selection buttons */}
            {!importMode && (
              <div className="space-y-3 py-2">
                {existingProperties.length > 0 && (
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => {
                      exportPropertiesToCSV(existingProperties, `backup-properties-${new Date().toISOString().slice(0,10)}.csv`);
                      setBackupDone(true);
                      toast({ title: 'Backup Downloaded', description: `${existingProperties.length} properties exported as CSV.` });
                    }}
                  >
                    <Download className="w-4 h-4" />
                    Download Backup ({existingProperties.length} listings)
                    {backupDone && <CheckCircle2 className="w-4 h-4 text-primary ml-auto" />}
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => setImportMode('add')}
                >
                  Add to Existing — keep current listings and add new ones
                </Button>
                <Button
                  variant={backupDone || existingProperties.length === 0 ? 'destructive' : 'outline'}
                  className="w-full justify-start gap-2"
                  onClick={() => setImportMode('clear')}
                  disabled={existingProperties.length > 0 && !backupDone}
                >
                  Clear & Import Fresh — delete all current listings first
                  {existingProperties.length > 0 && !backupDone && (
                    <span className="text-xs ml-auto opacity-70">(download backup first)</span>
                  )}
                </Button>
              </div>
            )}

            {/* Pre-scan section */}
            {importMode && !scanDone && (
              <div className="flex justify-center py-4">
                <Button onClick={handleScan} disabled={isScanning} size="lg">
                  {isScanning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Scanning {csvRowCount} rows...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Scan CSV File
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Scan results: invalid rows */}
            {scanDone && invalidRows.length > 0 && !importDone && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                  <AlertTriangle className="w-4 h-4" />
                  {invalidRows.length} row(s) will be skipped:
                </div>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  {invalidRows.map((r) => (
                    <li key={r.rowIndex}>
                      <span className="font-mono">WP-{r.wpId || '?'}</span>{' '}
                      {r.title ? `"${r.title}"` : '(no title)'} — {r.issues.join(', ')}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Progress indicator */}
            {scanDone && (totalImported > 0 || totalFailed > 0 || importDone) && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {totalImported} of {csvRowCount} properties imported
                  </span>
                  <span className="text-muted-foreground">
                    {Math.round(progressPercent)}%
                  </span>
                </div>
                <Progress value={progressPercent} className="h-2" />
                {totalFailed > 0 && (
                  <p className="text-xs text-destructive">{totalFailed} failed / skipped</p>
                )}
                {allBatchesDone && (
                  <div className="flex items-center gap-2 text-sm text-primary font-medium pt-1">
                    <CheckCircle2 className="w-4 h-4" />
                    All batches complete!
                  </div>
                )}
              </div>
            )}

            {/* Import All button */}
            {scanDone && !allBatchesDone && !autoRunning && (
              <Button
                onClick={handleImportAll}
                className="w-full"
                size="lg"
                disabled={importingBatch !== null}
              >
                <PlayCircle className="w-4 h-4 mr-2" />
                Import All Batches
              </Button>
            )}

            {autoRunning && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Auto-importing batch {(importingBatch ?? 0) + 1} of {totalBatches}...
              </div>
            )}

            {/* Batch buttons */}
            {scanDone && !importDone && (
              <div className="grid gap-2">
                {Array.from({ length: totalBatches }, (_, i) => {
                  const start = i * BATCH_SIZE + 1;
                  const end = Math.min((i + 1) * BATCH_SIZE, csvRowCount);
                  const isDone = completedBatches.has(i);
                  const isRunning = importingBatch === i;
                  return (
                    <Button
                      key={i}
                      variant={isDone ? 'secondary' : 'outline'}
                      size="sm"
                      disabled={isDone || isRunning || importingBatch !== null || autoRunning}
                      onClick={() => handleBatchClick(i)}
                      className="justify-between"
                    >
                      <span>Batch {i + 1}: Rows {start}–{end}</span>
                      {isRunning && <Loader2 className="w-4 h-4 animate-spin" />}
                      {isDone && <span className="text-xs text-primary">✓ Done</span>}
                    </Button>
                  );
                })}
              </div>
            )}

            {/* Final report */}
            {importDone && failedRows.length > 0 && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                  <AlertTriangle className="w-4 h-4" />
                  {failedRows.length} listing(s) could not be imported:
                </div>
                <p className="text-xs text-muted-foreground">
                  These need to be added manually via the "Add Listing" form.
                </p>
                <ul className="text-xs space-y-1.5 text-muted-foreground">
                  {failedRows.map((r, idx) => (
                    <li key={idx} className="flex flex-col">
                      <span className="font-medium text-foreground">
                        <span className="font-mono text-destructive">WP-{r.wpId}</span>{' '}
                        {r.title || '(no title)'}
                      </span>
                      <span className="text-destructive/80 text-[11px]">{r.error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {importDone && failedRows.length === 0 && (
              <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-center">
                <CheckCircle2 className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">All listings imported successfully!</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalImported} properties are now in the database.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={importingBatch !== null || autoRunning}>
            {importDone ? 'Close' : 'Cancel'}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

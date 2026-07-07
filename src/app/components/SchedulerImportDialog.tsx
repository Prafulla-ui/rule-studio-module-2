import { useRef, useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown, Loader2, Upload, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';
import { CustomButton } from './CustomButton';
import { toast } from 'sonner@2.0.3';
import type { ImportSummary } from '../utils/schedulerImportValidation';

const IMPORT_REQUIREMENTS = [
  'File must be in .xlsx format. Do not change the format or template structure.',
  'Maximum file size is 25 MB. Avoid uploading corrupt or empty files.',
  'It is mandatory to fill the Details worksheet.',
  'Generation Time must be in 24-hour format (e.g., 18:30).',
  'All other time fields should be in 12-hour format with AM/PM (e.g., 09:30 AM).',
  'Date format must strictly follow dd-Mmm-YYYY (e.g., 18-Jun-2017).',
  'For multiple pickup and drop-off locations, provide different locations in separate rows.',
  'A detailed validation summary will be shown after the import process completes.',
  'An import summary will be displayed once processing is finished.',
];

const MAX_FILE_SIZE_MB = 25;

const PROCESSING_STEPS = [
  'Validating file...',
  'Importing schedulers...',
  'Preparing summary...',
] as const;

const PROCESSING_STEP_MS = 1000;
const PROCESSING_TOTAL_MS = PROCESSING_STEPS.length * PROCESSING_STEP_MS;

interface SchedulerImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport?: (file: File) => ImportSummary | null;
  onSave?: () => void;
}

export function SchedulerImportDialog({
  open,
  onOpenChange,
  onImport,
  onSave,
}: SchedulerImportDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const processingTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [requirementsOpen, setRequirementsOpen] = useState(false);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);

  const importCompleted = importSummary !== null && importSummary.created > 0;

  const clearProcessingTimeouts = () => {
    processingTimeoutsRef.current.forEach(clearTimeout);
    processingTimeoutsRef.current = [];
  };

  useEffect(() => () => clearProcessingTimeouts(), []);

  const resetState = () => {
    clearProcessingTimeouts();
    setSelectedFile(null);
    setImportSummary(null);
    setRequirementsOpen(false);
    setIsProcessing(false);
    setProcessingStep(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isProcessing) return;
    if (!nextOpen) {
      resetState();
    }
    onOpenChange(nextOpen);
  };

  const validateFile = (file: File): boolean => {
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      toast.error('Please upload a valid .xlsx file.');
      return false;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`File size must not exceed ${MAX_FILE_SIZE_MB} MB.`);
      return false;
    }
    return true;
  };

  const handleFileSelect = (file: File | null) => {
    if (!file) return;
    if (validateFile(file)) {
      setSelectedFile(file);
      setImportSummary(null);
    } else {
      setSelectedFile(null);
      setImportSummary(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file ?? null);
  };

  const handleImport = () => {
    if (!selectedFile || isProcessing) return;

    if (!onImport) {
      toast.info('Import schedulers from Excel functionality coming soon');
      return;
    }

    clearProcessingTimeouts();
    setIsProcessing(true);
    setProcessingStep(0);
    setImportSummary(null);

    const schedule = (callback: () => void, delayMs: number) => {
      const timeoutId = setTimeout(callback, delayMs);
      processingTimeoutsRef.current.push(timeoutId);
    };

    schedule(() => setProcessingStep(1), PROCESSING_STEP_MS);
    schedule(() => setProcessingStep(2), PROCESSING_STEP_MS * 2);

    schedule(() => {
      const summary = onImport(selectedFile);
      setIsProcessing(false);
      setProcessingStep(0);
      clearProcessingTimeouts();

      if (summary && summary.created > 0) {
        setImportSummary(summary);
      } else {
        setImportSummary(summary);
        toast.error('Import failed. No schedulers were created.');
      }
    }, PROCESSING_TOTAL_MS);
  };

  const handleSave = () => {
    if (!importCompleted) return;
    onSave?.();
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#2c3e50]">Import schedulers from Excel</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isProcessing && (
            <div
              className="flex flex-col items-center justify-center gap-4 rounded-lg border border-gray-200 bg-gray-50 px-6 py-12"
              role="status"
              aria-live="polite"
              aria-busy="true"
            >
              <Loader2 className="h-10 w-10 text-[#ff9800] animate-spin" />
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-[#2c3e50]">Processing your file</p>
                <p className="text-xs text-gray-500">{PROCESSING_STEPS[processingStep]}</p>
              </div>
              <div className="flex gap-2" aria-hidden="true">
                {PROCESSING_STEPS.map((_, index) => (
                  <span
                    key={index}
                    className={`h-1.5 w-8 rounded-full transition-colors ${
                      index <= processingStep ? 'bg-[#ff9800]' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              {selectedFile && (
                <p className="text-xs text-gray-400 max-w-xs truncate">{selectedFile.name}</p>
              )}
            </div>
          )}

          {!importCompleted && !isProcessing && (
            <>
              <Collapsible open={requirementsOpen} onOpenChange={setRequirementsOpen}>
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-left text-sm font-medium text-gray-800 hover:bg-gray-100 transition-colors">
                  <span>File requirements</span>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-500 transition-transform ${requirementsOpen ? 'rotate-180' : ''}`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <p className="text-xs font-medium text-amber-900 mb-2">Note:</p>
                  <ul className="space-y-1.5 text-xs text-amber-800 list-disc ml-4">
                    {IMPORT_REQUIREMENTS.map((requirement) => (
                      <li key={requirement}>{requirement}</li>
                    ))}
                  </ul>
                </CollapsibleContent>
              </Collapsible>

              {!requirementsOpen && (
                <p className="text-xs text-gray-500">
                  .xlsx only, max {MAX_FILE_SIZE_MB} MB. Details worksheet is required.
                </p>
              )}

              <div>
                <div
                  role="button"
                  tabIndex={0}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 cursor-pointer transition-colors ${
                    isDragging
                      ? 'border-[#ff9800] bg-orange-50'
                      : 'border-gray-300 bg-gray-50 hover:border-[#ff9800] hover:bg-orange-50/50'
                  }`}
                >
                  <Upload className="h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-700 font-medium">
                    Drag and drop your .xlsx file, or browse
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedFile ? selectedFile.name : 'No file chosen'}
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
                />
              </div>
            </>
          )}

          {importSummary && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
              <p className="text-sm font-semibold text-[#2c3e50]">Import summary</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="inline-flex items-center gap-1.5 text-green-700">
                  <CheckCircle2 className="h-4 w-4" />
                  {importSummary.created} scheduler{importSummary.created === 1 ? '' : 's'} created
                </span>
                {importSummary.needsAttention > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-amber-700">
                    <AlertTriangle className="h-4 w-4" />
                    {importSummary.needsAttention} need attention
                  </span>
                )}
                {importSummary.skipped > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-red-700">
                    <XCircle className="h-4 w-4" />
                    {importSummary.skipped} row{importSummary.skipped === 1 ? '' : 's'} skipped
                  </span>
                )}
              </div>
              <ul className="space-y-1.5 max-h-32 overflow-y-auto text-xs text-gray-700">
                {importSummary.rowDetails.map((row) => (
                  <li key={row.name} className="flex items-start gap-2">
                    {row.status === 'complete' && <CheckCircle2 className="h-3.5 w-3.5 text-green-600 mt-0.5 shrink-0" />}
                    {row.status === 'needs_attention' && <AlertTriangle className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />}
                    {row.status === 'skipped' && <XCircle className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />}
                    <span>
                      <span className="font-medium">{row.name}</span>
                      {row.message && <span className="text-gray-500"> — {row.message}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {!isProcessing && (
        <DialogFooter className="gap-2 sm:gap-2">
          <CustomButton variant="secondary" onClick={() => handleOpenChange(false)}>
            Cancel
          </CustomButton>
          {!importCompleted ? (
            <CustomButton
              variant="primary"
              onClick={handleImport}
              disabled={!selectedFile}
            >
              Import schedulers
            </CustomButton>
          ) : (
            <CustomButton variant="primary" onClick={handleSave}>
              Save
            </CustomButton>
          )}
        </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}


import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { googleDriveService, BatchUploadResult } from '@/services/googleDriveService';
import { toast } from '@/hooks/use-toast';

interface BatchUploadManagerProps {
  teacherId: string;
  onUploadComplete: (result: BatchUploadResult) => void;
}

const BatchUploadManager: React.FC<BatchUploadManagerProps> = ({
  teacherId,
  onUploadComplete
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [csvContent, setCsvContent] = useState('');
  const [uploadResult, setUploadResult] = useState<BatchUploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCsvContent(content);
      };
      reader.readAsText(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a CSV file",
        variant: "destructive",
      });
    }
  };

  const downloadTemplate = () => {
    const template = `url,title,description,type,subject,chapter,grade
https://drive.google.com/file/d/example1/view,Chapter 1 Notes,Introduction to Physics,textbook,Physics,Introduction,10
https://docs.google.com/document/d/example2/edit,Chapter 1 Video,Physics Fundamentals Video,video,Physics,Introduction,10
https://docs.google.com/presentation/d/example3/edit,Chapter 1 Slides,Introduction Presentation,ppt,Physics,Introduction,10`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'google_drive_upload_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const processBatchUpload = async () => {
    if (!csvContent.trim()) {
      toast({
        title: "No Content",
        description: "Please provide CSV content or upload a file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Parse CSV data
      const parsedData = googleDriveService.parseCsvData(csvContent);
      
      if (parsedData.length === 0) {
        toast({
          title: "No Valid Data",
          description: "No valid Google Drive links found in the CSV",
          variant: "destructive",
        });
        setIsUploading(false);
        return;
      }

      // Add teacher ID to each item
      const linksWithTeacher = parsedData.map(item => ({
        ...item,
        teacherId,
        isPublic: true
      }));

      // Process batch upload with progress tracking
      const result = await googleDriveService.batchIngestLinks(linksWithTeacher);
      
      setUploadProgress(100);
      setUploadResult(result);
      onUploadComplete(result);

      if (result.success) {
        toast({
          title: "Batch Upload Complete",
          description: `Successfully uploaded ${result.summary.successful} out of ${result.summary.total} items`,
        });
      } else {
        toast({
          title: "Upload Issues",
          description: `${result.summary.failed} items failed to upload`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Batch upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to process batch upload",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Upload className="h-5 w-5 text-[#00E676]" />
          Batch Google Drive Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template Download */}
        <div className="bg-[#2979FF]/10 border border-[#2979FF]/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-[#2979FF] font-medium mb-1">Download Template</h4>
              <p className="text-sm text-[#E0E0E0]">
                Get the CSV template with proper format for batch uploads
              </p>
            </div>
            <Button
              onClick={downloadTemplate}
              variant="outline"
              size="sm"
              className="border-[#2979FF] text-[#2979FF] hover:bg-[#2979FF]/10"
            >
              <Download className="h-4 w-4 mr-2" />
              Template
            </Button>
          </div>
        </div>

        {/* File Upload */}
        <div className="space-y-2">
          <Label className="text-[#E0E0E0]">Upload CSV File</Label>
          <div className="flex gap-2">
            <Input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="bg-[#121212] border-[#424242] text-white"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="border-[#424242] text-[#E0E0E0] hover:bg-[#424242]"
            >
              <FileText className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Manual CSV Input */}
        <div className="space-y-2">
          <Label className="text-[#E0E0E0]">Or Paste CSV Content</Label>
          <Textarea
            value={csvContent}
            onChange={(e) => setCsvContent(e.target.value)}
            placeholder="url,title,description,type,subject,chapter,grade"
            className="bg-[#121212] border-[#424242] text-white placeholder:text-[#666666] min-h-[120px]"
          />
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#E0E0E0]">Processing uploads...</span>
              <span className="text-sm text-[#E0E0E0]">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {/* Upload Results */}
        {uploadResult && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[#121212] rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-white">{uploadResult.summary.total}</div>
                <div className="text-sm text-[#999999]">Total</div>
              </div>
              <div className="bg-[#121212] rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-[#00E676]">{uploadResult.summary.successful}</div>
                <div className="text-sm text-[#999999]">Success</div>
              </div>
              <div className="bg-[#121212] rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-[#FF7043]">{uploadResult.summary.failed}</div>
                <div className="text-sm text-[#999999]">Failed</div>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="max-h-48 overflow-y-auto space-y-2">
              {uploadResult.results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-2 bg-[#121212] rounded border border-[#424242]"
                >
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-[#00E676] flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-[#FF7043] flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{result.title}</div>
                    {!result.success && result.error && (
                      <div className="text-xs text-[#FF7043]">{result.error}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Button */}
        <Button
          onClick={processBatchUpload}
          disabled={isUploading || !csvContent.trim()}
          className="w-full bg-[#00E676] text-black hover:bg-[#00E676]/90"
        >
          {isUploading ? (
            <>Processing {uploadProgress}%...</>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Process Batch Upload
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default BatchUploadManager;

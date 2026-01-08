import { useState, useRef } from 'react';
import Layout from '../components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload as UploadIcon, FileText, AlertCircle, CheckCircle2, Loader2, Wand2, Music, FileType } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FileUpload = ({ file, fileInputRef, handleRemoveFile, handleChange, handleDrag, dragActive, handleDrop, simulateProcessing, getFileIcon, error }: any) => {
  return (
    <div className="flex-1 flex flex-col">
      {file ? (
        // File Preview State
        <div className="flex-1 flex flex-col items-center justify-center p-12 animate-fadeIn bg-background border border-primary rounded-3xl">
          <div className="w-24 h-24 bg-card rounded-3xl flex items-center justify-center mb-6 shadow-sm">
            {getFileIcon(file.type)}
          </div>
          <h3 className="text-xl font-medium text-foreground mb-2">{file.name}</h3>
          <p className="text-muted-foreground text-sm mb-8">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>

          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={handleRemoveFile}
              className="px-6 py-6 rounded-xl border border-primary text-primary hover:text-background hover:bg-primary font-medium"
            >
              Remove
            </Button>
            <Button
              onClick={simulateProcessing}
              className="px-8 py-6 rounded-xl border  bg-primary text-background hover:bg-background hover:text-primary hover:border-primary font-medium shadow-lg shadow-primary/20 flex items-center gap-2"
            >
              <Wand2 className="w-4 h-4" />
              Generate Materials
            </Button>
          </div>
        </div>
      ) : (
        // Drag & Drop State
        <form
          className="flex-1 flex flex-col"
          onDragEnter={handleDrag}
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            ref={fileInputRef}
            type="file"
            id="file-upload"
            multiple={false}
            onChange={handleChange}
            className="hidden"
            accept=".mp3,.wav,.pdf,.txt"
          />
          <label
            htmlFor="file-upload"
            className={`flex-1 flex flex-col items-center justify-center p-12 transition-all cursor-pointer border-2 border-dashed border-border rounded-3xl
                         ${dragActive
                ? 'bg-background/80'
                : 'hover:bg-card bg-background'
              } ${error ? 'border-red-300 bg-red-50' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-transform duration-300 ${dragActive ? 'scale-110 shadow-md shadow-primary' : 'shadow-sm shadow-primary'}`}>
              <UploadIcon className="w-10 h-10" />
            </div>

            <div className="text-center max-w-sm">
              <h3 className="text-xl font-medium text-foreground mb-2">
                {dragActive ? "Drop file here" : "Click to upload or drag and drop"}
              </h3>
              <p className="text-muted-foreground text-sm mb-6">
                MP3, WAV, PDF up to 50MB
              </p>
              {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-100/50 px-4 py-2 rounded-full mx-auto w-fit">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </div>
          </label>
        </form>
      )}
    </div>
  )
}

export const Processing = ({ progress, steps, currentStep }: { progress: number, steps: any[], currentStep: number }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 bg-background border border-primary rounded-3xl">
      <div className="w-full max-w-md">
        {/* Progress Visual */}
        <div className="mb-10 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 relative shadow-[0_0_15px_var(--primary)]">
            <div className="absolute inset-0 rounded-full"></div>
            <svg className="absolute inset-0 w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
              <circle
                cx="50" cy="50" r="46"
                fill="none"
                stroke="#5F6F52"
                strokeWidth="4"
                strokeDasharray="289" // 2 * pi * 46
                strokeDashoffset={289 - (289 * progress) / 100}
                strokeLinecap="round"
                className="transition-all duration-300 ease-linear"
              />
            </svg>
            <span className="text-lg font-bold text-primary">{progress}%</span>
          </div>
          <h3 className="text-2xl font-serif text-foreground mb-2">{steps[currentStep].title}</h3>
          <p className="text-foreground">{steps[currentStep].desc}</p>
        </div>

        {/* Steps List */}
        <div className="space-y-4">
          {steps.map((step, idx) => (
            <div
              key={step.id}
              className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${idx === currentStep ? 'bg-secondary border border-primary/20' : ''
                }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${idx < currentStep ? 'bg-primary text-primary-foreground' :
                idx === currentStep ? 'bg-card text-primary border border-primary' :
                  'bg-muted text-gray-300'
                }`}>
                {idx < currentStep ? <CheckCircle2 className="w-5 h-5" /> :
                  idx === currentStep ? <Loader2 className="w-4 h-4 animate-spin" /> :
                    <span className="text-sm font-medium">{idx + 1}</span>}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${idx <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                  }`}>{step.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Upload() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragActive, setDragActive] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Processing State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);

  const steps = [
    { id: 0, title: "Uploading File", desc: "Securely transferring your data..." },
    { id: 1, title: "Transcribing Audio", desc: "Converting speech to text..." },
    { id: 2, title: "Generating Summary", desc: "Analyzing key concepts..." },
    { id: 3, title: "Creating Flashcards", desc: "Building study materials..." },
    { id: 4, title: "Finalizing", desc: "Preparing your study guide..." }
  ];

  const handleDrag = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file: File) => {
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'application/pdf', 'text/plain'];
    if (!validTypes.includes(file.type)) {
      setError("Unsupported file format. Please upload MP3, WAV, PDF, or TXT.");
      return false;
    }
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      setError("File size too large. Maximum size is 50MB.");
      return false;
    }
    return true;
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const simulateProcessing = () => {
    setIsProcessing(true);
    let step = 0;
    let prog = 0;
    const interval = setInterval(() => {
      prog += 1;
      setProgress(prog);

      // Verify logic - map progress to steps
      if (prog < 20) step = 0;
      else if (prog < 40) step = 1;
      else if (prog < 60) step = 2;
      else if (prog < 80) step = 3;
      else step = 4;

      setCurrentStep(step);

      if (prog >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          navigate('/notes/note_new');
        }, 800);
      }
    }, 80); // Total time approx 8s
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('audio')) return <Music className="w-8 h-8 text-primary" />;
    if (fileType.includes('pdf')) return <FileText className="w-8 h-8 text-primary" />;
    return <FileType className="w-8 h-8 text-primary" />;
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-serif text-foreground mb-4">Upload Materials</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Upload your lecture recordings, PDFs, or notes. We'll automatically generate summaries, flashcards, and quizzes for you.
          </p>
        </header>

        {/* Main Content Area */}
        <Card className="rounded-3xl shadow-sm overflow-hidden mb-8 min-h-[400px] flex flex-col pt-0 pl-0 pr-0 pb-0 border-none">

          {!isProcessing ? (
            // Upload State
            <FileUpload file={file} fileInputRef={fileInputRef} handleRemoveFile={handleRemoveFile} handleChange={handleChange} handleDrag={handleDrag} dragActive={dragActive} handleDrop={handleDrop} simulateProcessing={simulateProcessing} getFileIcon={getFileIcon} error={error}/>
          ) : (
            // Processing State
            <Processing progress={progress} steps={steps} currentStep={currentStep} />
          )}
        </Card>

        {/* Recent Uploads Footer (Optional) */}
        {
          !isProcessing && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">Supported Platforms</p>
              <div className="flex justify-center gap-8 opacity-60 hover:opacity-100 transition-opacity duration-500">
                {/* Google Drive */}
                <div className="flex items-center gap-2 group cursor-default">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" alt="Google Drive" className="w-5 h-5 filter grayscale group-hover:grayscale-0 transition-all" />
                  <span className="font-semibold text-muted-foreground group-hover:text-muted-foreground transition-colors">Google Drive</span>
                </div>

                {/* OneDrive */}
                <div className="flex items-center gap-2 group cursor-default">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Microsoft_OneDrive_Icon_%282025_-_present%29.svg" alt="OneDrive" className="w-5 h-5 filter grayscale group-hover:grayscale-0 transition-all" />
                  <span className="font-semibold text-muted-foreground group-hover:text-muted-foreground transition-colors">OneDrive</span>
                </div>

                {/* Dropbox */}
                <div className="flex items-center gap-2 group cursor-default">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Dropbox_Icon.svg" alt="Dropbox" className="w-5 h-5 filter grayscale group-hover:grayscale-0 transition-all" />
                  <span className="font-semibold text-muted-foreground group-hover:text-muted-foreground transition-colors">Dropbox</span>
                </div>
              </div>
            </div>
          )
        }
      </div >
    </Layout >
  );
}
import { ArrowLeft, Share2, Download, PlayCircle, BookOpen, Quote } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import mockData from '../data/mockData.json';

export default function NoteDetail() {
   const navigate = useNavigate();
   const { id } = useParams();
   const note = mockData.notes.find(n => n.id === id);

   if (!note) {
      return (
         <Layout>
            <div className="text-center py-20">
               <h2 className="text-2xl font-serif text-foreground">Note not found</h2>
               <Button variant="link" onClick={() => navigate('/notes')} className="text-primary hover:underline mt-4">Back to Notes</Button>
            </div>
         </Layout>
      );
   }

   return (
      <Layout>
         <div className="max-w-7xl mx-auto">
            <Button
               variant="ghost"
               onClick={() => navigate('/notes')}
               className="flex items-center text-muted-foreground hover:text-primary transition-colors mb-6 pl-0 hover:bg-transparent"
            >
               <ArrowLeft className="w-4 h-4 mr-2" />
               Back to Notes
            </Button>

            <header className="mb-8">
               <div className="flex justify-between items-start mb-4">
                  <div>
                     <div className="flex gap-2 mb-3">
                        <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-md">{note.subject}</span>
                        <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-md">{new Date(note.createdAt).toLocaleDateString()}</span>
                     </div>
                     <h1 className="text-4xl font-serif text-foreground mb-2">{note.title}</h1>
                  </div>
                  <div className="flex gap-2">
                     <Button size="icon" variant="outline" className="text-muted-foreground hover:text-primary rounded-full hover:bg-muted">
                        <Share2 className="w-5 h-5" />
                     </Button>
                     <Button size="icon" variant="outline" className="text-muted-foreground hover:text-primary rounded-full hover:bg-muted">
                        <Download className="w-5 h-5" />
                     </Button>
                  </div>
               </div>

               <div className="p-4 rounded-xl border border-border flex items-end gap-4 bg-background">
                  <Button size="icon" className="w-12 h-12 bg-primary rounded-full text-primary-foreground hover:bg-[#4A5A40] shadow-lg">
                     <PlayCircle className="w-6 h-6" />
                  </Button>
                  <div className="flex-1 pb-1">
                     <div className="h-1 bg-muted rounded-full mb-1">
                        <div className="w-1/3 h-full bg-primary rounded-full"></div>
                     </div>
                     <div className="flex justify-between text-xs text-muted-foreground">
                        <span>12:45</span>
                        <span>{note.recordingDuration}</span>
                     </div>
                  </div>
               </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {/* Main Content */}
               <div className="md:col-span-2 space-y-8">
                  <Card className="p-8 shadow-sm bg-background border border-border">
                     <div className="flex items-center gap-2 mb-6">
                        <BookOpen className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-medium text-foreground">Summary</h2>
                     </div>
                     <p className="text-muted-foreground leading-relaxed">
                        {note.summary}
                     </p>
                  </Card>

                  <Card className="p-8 shadow-sm bg-background border border-border">
                     <div className="flex items-center gap-2 mb-6">
                        <Quote className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-medium text-foreground">Key Concepts</h2>
                     </div>
                     <div className="space-y-4">
                        {note.keyConcepts.map((concept, i) => (
                           <div key={i} className="p-4 bg-background rounded-xl border border-border">
                              <h3 className="font-medium text-foreground mb-1">{concept.title}</h3>
                              <p className="text-sm text-muted-foreground">{concept.description}</p>
                           </div>
                        ))}
                     </div>
                  </Card>
               </div>

               {/* Sidebar */}
               <div className="space-y-6">
                  <Card className="p-6 shadow-sm sticky top-8 bg-background border border-border">
                     <h3 className="font-medium text-foreground mb-4">Transcript</h3>
                     <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {note.transcript.length > 0 ? (
                           note.transcript.map((entry, i) => (
                              <div key={i} className="group cursor-pointer hover:bg-muted p-2 rounded-lg transition-colors">
                                 <span className="text-xs font-mono text-primary block mb-1 opacity-60 group-hover:opacity-100">{entry.timestamp}</span>
                                 <p className="text-sm text-muted-foreground">{entry.text}</p>
                              </div>
                           ))
                        ) : (
                           <p className="text-sm text-muted-foreground italic">No transcript available.</p>
                        )}
                     </div>
                  </Card>
               </div>
            </div>
         </div>
      </Layout>
   );
}

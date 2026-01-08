import Layout from '../components/layout/Layout';
import { FileText, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import mockData from '../data/mockData.json';

export default function Notes() {
   const navigate = useNavigate();

   // Helper function to format date
   const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
         month: 'short',
         day: 'numeric',
         year: 'numeric'
      });
   };

   return (
      <Layout>
         <header className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-serif text-foreground">My Notes</h1>
            <div className="flex gap-4">
               <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                     type="text"
                     placeholder="Search notes..."
                     className="pl-10 pr-4 py-2 rounded-full border border-border focus:outline-none focus:border-primary w-64"
                  />
               </div>
               <Button size="icon" variant="outline" className="rounded-full text-muted-foreground">
                  <Filter className="w-5 h-5" />
               </Button>
            </div>
         </header>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockData.notes.map(note => (
               <Card
                  key={note.id}
                  onClick={() => navigate(`/notes/${note.id}`)}
                  className="p-6 cursor-pointer hover:shadow-md transition-shadow group bg-background border-border"
               >
                  <div className="flex justify-between items-start mb-4">
                     <div className="p-2 bg-secondary rounded-lg text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <FileText className="w-5 h-5" />
                     </div>
                     <span className="text-xs text-muted-foreground">{formatDate(note.createdAt)}</span>
                  </div>
                  <h3 className="font-serif text-lg font-medium mb-2 text-foreground">{note.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                     {note.summary}
                  </p>
                  <div className="flex flex-wrap gap-2">
                     <span className="text-xs px-2 py-1 bg-muted rounded-md text-muted-foreground">{note.subject}</span>
                     {note.tags.map((tag, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-muted rounded-md text-muted-foreground">{tag}</span>
                     ))}
                  </div>
               </Card>
            ))}
         </div>
      </Layout >
   );
}

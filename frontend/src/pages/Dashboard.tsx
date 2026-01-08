import Layout from '../components/layout/Layout';
import { Upload, FileText, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import mockData from '../data/mockData.json';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
   const navigate = useNavigate();

   return (
      <Layout>
         <header className="mb-8">
            <h1 className="text-3xl font-serif text-foreground mb-2">Welcome back, Alex</h1>
            <p className="text-muted-foreground">Here's what's happening with your study materials.</p>
         </header>

         {/* Quick Action - Upload */}
         <div
            onClick={() => navigate('/upload')}
            className="rounded-3xl p-8 mb-10 overflow-hidden relative group cursor-pointer transition-transform hover:scale-[1.01] shadow-[0_0_30px_var(--primary)] bg-transparent"
         >
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
               <div>
                  <div className="w-12 h-12 bg-card/10 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm bg-background">
                     <Upload className="w-6 h-6 text-card-foreground" />
                  </div>
                  <h2 className="text-2xl font-serif mb-2">Upload New Material</h2>
                  <p className="text-muted-foreground max-w-md">Drag and drop your audio lectures or PDF notes here to instantly generate study aids.</p>
               </div>
               <Button className="px-6 py-5 bg-foreground text-background shadow-md shadow-primary rounded-full font-medium transition-colors">
                  Start Upload
               </Button>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Activity */}
            <div className="lg:col-span-2">
               <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-medium text-foreground">Recent Activity</h2>
                  <Button variant="ghost" className="text-sm text-primary hover:text-primary hover:bg-transparent hover:underline px-0">View All</Button>
               </div>

               <div className="space-y-4">
                  {mockData.recentActivity.map((activity) => (
                     <Card key={activity.id} className="p-4 flex items-center gap-4 hover:shadow-sm transition-shadow border-border bg-background">
                        <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center text-primary">
                           <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                           <h3 className="font-medium text-foreground">{activity.title}</h3>
                           <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{new Date(activity.timestamp).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>{activity.details.duration || `${activity.details.cardsReviewed || activity.details.score} items`}</span>
                           </div>
                        </div>
                        <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-muted">
                           <ArrowRight className="w-4 h-4" />
                        </Button>
                     </Card>
                  ))}
               </div>
            </div>

            {/* Stats / Quick Stats - keeping static for now or could mock too */}
            <div className="space-y-6">
               <Card className="p-6 bg-background border-border shadow-sm">
                  <h3 className="font-medium text-muted-foreground text-sm mb-1 uppercase tracking-wider">Total Notes</h3>
                  <p className="text-4xl font-serif text-foreground">{mockData.notes.length}</p>
               </Card>
               <Card className="p-6 bg-background border-border shadow-sm">
                  <h3 className="font-medium text-muted-foreground text-sm mb-1 uppercase tracking-wider">Flashcards Mastered</h3>
                  <p className="text-4xl font-serif text-foreground">
                     {mockData.flashcardDecks.reduce((acc, deck) => acc + deck.masteredCards, 0)}
                  </p>
               </Card>
            </div>
         </div>
      </Layout >
   );
}

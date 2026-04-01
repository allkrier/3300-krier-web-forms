import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";

export default function HomePage() {
  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-8 h-8 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4" data-testid="heading-title">
          Free Time Survey
        </h1>
        
        <p className="text-lg text-gray-600 max-w-xl mx-auto mb-10" data-testid="text-welcome">
          Welcome to the Free Time Survey for university students. We are collecting data to better understand how students balance their academics, hobbies, and personal time. Your responses are anonymous and greatly appreciated.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Button asChild size="lg" className="w-full sm:w-auto text-base font-semibold px-8" data-testid="button-take-survey">
            <Link href="/survey">Take the Survey</Link>
          </Button>
          
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto text-base font-semibold px-8 border-gray-300 hover:bg-gray-50" data-testid="button-view-results-home">
            <Link href="/results">View Results</Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
}

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-muted-foreground">404</h1>
        <p className="text-2xl font-semibold mt-4 mb-2">Page Not Found</p>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button asChild size="lg">
          <Link to="/">Go to Home</Link>
        </Button>
      </div>
    </div>
  );
};

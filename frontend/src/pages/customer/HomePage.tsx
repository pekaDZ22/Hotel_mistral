import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Hotel, Calendar, Users } from 'lucide-react';

export const HomePage = () => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Hotel Management System</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Find and book the perfect hotel for your stay
        </p>
        
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link to="/hotels">
              <Hotel className="mr-2 h-4 w-4" />
              Browse Hotels
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/bookings">
              <Calendar className="mr-2 h-4 w-4" />
              My Bookings
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-lg p-6 border">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Hotel className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Find Hotels</h3>
              <p className="text-sm text-muted-foreground">
                Browse thousands of hotels worldwide
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 border">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Book Rooms</h3>
              <p className="text-sm text-muted-foreground">
                Reserve rooms with ease
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 border">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Manage Account</h3>
              <p className="text-sm text-muted-foreground">
                View your bookings and profile
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary to-indigo-600 rounded-lg p-8 text-white">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold mb-4">Ready to book?</h2>
          <p className="mb-6">
            Start your journey by browsing our selection of hotels and finding the perfect room for your stay.
          </p>
          <Button asChild variant="secondary" size="lg">
            <Link to="/hotels">
              Browse Hotels Now
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Clock, MapPin, IndianRupee, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Train {
  id: string;
  train_number: string;
  train_name: string;
  from_station: string;
  to_station: string;
  departure_time: string;
  arrival_time: string;
  available_seats: number;
  price_per_seat: number;
}

const Trains = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const date = searchParams.get("date") || "";

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    fetchTrains();
  }, [from, to]);

  const fetchTrains = async () => {
    setLoading(true);
    let query = supabase.from("trains").select("*");

    if (from) {
      query = query.ilike("from_station", `%${from}%`);
    }
    if (to) {
      query = query.ilike("to_station", `%${to}%`);
    }

    const { data, error } = await query;

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch trains",
        variant: "destructive",
      });
    } else {
      setTrains(data || []);
    }
    setLoading(false);
  };

  const handleBooking = (train: Train) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to book tickets",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (train.available_seats === 0) {
      toast({
        title: "No Seats Available",
        description: "This train is fully booked",
        variant: "destructive",
      });
      return;
    }

    navigate(`/book/${train.id}?date=${date}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent to-background">
      <Navbar user={user} />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Available Trains</h1>
          <p className="text-muted-foreground">
            {from} → {to} on {new Date(date).toLocaleDateString()}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading trains...</div>
        ) : trains.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-lg text-muted-foreground">
              No trains found for the selected route
            </p>
            <Button className="mt-4" onClick={() => navigate("/")}>
              Search Again
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {trains.map((train) => (
              <Card
                key={train.id}
                className="p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-[var(--transition-smooth)] bg-gradient-to-r from-card to-card/95"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{train.train_number}</Badge>
                      <h3 className="text-xl font-semibold">{train.train_name}</h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {train.from_station} → {train.to_station}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                          {train.departure_time} - {train.arrival_time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{train.available_seats} seats available</span>
                      </div>
                      <div className="flex items-center gap-2 font-semibold text-primary">
                        <IndianRupee className="h-4 w-4" />
                        <span>{train.price_per_seat.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleBooking(train)}
                    disabled={train.available_seats === 0}
                    size="lg"
                  >
                    {train.available_seats === 0 ? "Fully Booked" : "Book Now"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Trains;
import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const passengerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  age: z.number().min(1).max(120),
  email: z.string().email("Invalid email address").max(255),
});

const BookTrain = () => {
  const { trainId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [train, setTrain] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [passengerData, setPassengerData] = useState({
    name: "",
    age: "",
    email: "",
  });

  const date = searchParams.get("date") || "";

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        setPassengerData((prev) => ({ ...prev, email: session.user.email || "" }));
      }
    });
  }, [navigate]);

  useEffect(() => {
    if (trainId) {
      fetchTrain();
    }
  }, [trainId]);

  const fetchTrain = async () => {
    const { data, error } = await supabase
      .from("trains")
      .select("*")
      .eq("id", trainId)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch train details",
        variant: "destructive",
      });
      navigate("/");
    } else {
      setTrain(data);
    }
    setLoading(false);
  };

  const generateBookingReference = () => {
    return `RB${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      passengerSchema.parse({
        name: passengerData.name.trim(),
        age: parseInt(passengerData.age),
        email: passengerData.email.trim(),
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
        return;
      }
    }

    setBooking(true);

    const seatNumber = `${String.fromCharCode(65 + Math.floor(Math.random() * 6))}${Math.floor(Math.random() * 72) + 1}`;
    const bookingRef = generateBookingReference();

    const { error } = await supabase.from("bookings").insert({
      user_id: user.id,
      train_id: trainId,
      passenger_name: passengerData.name.trim(),
      passenger_age: parseInt(passengerData.age),
      passenger_email: passengerData.email.trim(),
      seat_number: seatNumber,
      journey_date: date,
      total_amount: train.price_per_seat,
      booking_reference: bookingRef,
    });

    if (error) {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Ticket booked successfully!",
      });
      navigate("/my-bookings");
    }
    setBooking(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent to-background">
      <Navbar user={user} />
      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6 gap-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="p-6 shadow-[var(--shadow-card)] h-fit">
            <h2 className="text-2xl font-bold mb-4">Train Details</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Train</p>
                <p className="font-semibold">
                  {train.train_number} - {train.train_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Route</p>
                <p className="font-semibold">
                  {train.from_station} → {train.to_station}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Timing</p>
                <p className="font-semibold">
                  {train.departure_time} - {train.arrival_time}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Journey Date</p>
                <p className="font-semibold">
                  {new Date(date).toLocaleDateString()}
                </p>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">Total Fare</p>
                <p className="text-2xl font-bold text-primary flex items-center gap-1">
                  <IndianRupee className="h-6 w-6" />
                  {train.price_per_seat.toFixed(2)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-2xl font-bold mb-4">Passenger Details</h2>
            <form onSubmit={handleBooking} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter passenger name"
                  value={passengerData.name}
                  onChange={(e) =>
                    setPassengerData({ ...passengerData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  min="1"
                  max="120"
                  placeholder="Enter age"
                  value={passengerData.age}
                  onChange={(e) =>
                    setPassengerData({ ...passengerData, age: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email"
                  value={passengerData.email}
                  onChange={(e) =>
                    setPassengerData({ ...passengerData, email: e.target.value })
                  }
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={booking}
              >
                {booking ? "Processing..." : "Confirm Booking"}
              </Button>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default BookTrain;
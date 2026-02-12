import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Ticket, Calendar, MapPin, User, IndianRupee, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Booking {
  id: string;
  passenger_name: string;
  passenger_age: number;
  passenger_email: string;
  seat_number: string;
  journey_date: string;
  booking_status: string;
  total_amount: number;
  booking_reference: string;
  created_at: string;
  trains: {
    train_number: string;
    train_name: string;
    from_station: string;
    to_station: string;
    departure_time: string;
    arrival_time: string;
  };
}

const MyBookings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchBookings(session.user.id);
      }
    });
  }, [navigate]);

  const fetchBookings = async (userId: string) => {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        trains (
          train_number,
          train_name,
          from_station,
          to_station,
          departure_time,
          arrival_time
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch bookings",
        variant: "destructive",
      });
    } else {
      setBookings(data || []);
    }
    setLoading(false);
  };

  const handleCancelBooking = async (bookingId: string) => {
    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", bookingId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to cancel booking",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Booking cancelled successfully",
      });
      fetchBookings(user.id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent to-background">
      <Navbar user={user} />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
          <p className="text-muted-foreground">
            View and manage your railway tickets
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <Card className="p-12 text-center">
            <Ticket className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground mb-4">
              No bookings found
            </p>
            <Button onClick={() => navigate("/")}>Search Trains</Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card
                key={booking.id}
                className="p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-[var(--transition-smooth)]"
              >
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge>{booking.trains.train_number}</Badge>
                      <h3 className="text-xl font-semibold">
                        {booking.trains.train_name}
                      </h3>
                      <Badge
                        variant={
                          booking.booking_status === "confirmed"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {booking.booking_status}
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {booking.trains.from_station} →{" "}
                            {booking.trains.to_station}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {new Date(booking.journey_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Ticket className="h-4 w-4 text-muted-foreground" />
                          <span>Seat: {booking.seat_number}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {booking.passenger_name}, {booking.passenger_age} yrs
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                          <IndianRupee className="h-4 w-4" />
                          <span>{booking.total_amount.toFixed(2)}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          PNR: {booking.booking_reference}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="gap-2">
                          <Trash2 className="h-4 w-4" />
                          Cancel
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. Your booking will be
                            cancelled and the seat will be released.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleCancelBooking(booking.id)}
                          >
                            Cancel Booking
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyBookings;
import { useEffect, useState } from "react";
import { Train, Clock, Shield, Ticket } from "lucide-react";
import Navbar from "@/components/Navbar";
import TrainSearchForm from "@/components/TrainSearchForm";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [user, setUser] = useState<any>(null);

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

  const features = [
    {
      icon: Train,
      title: "Wide Network",
      description: "Access to trains across all major routes",
    },
    {
      icon: Clock,
      title: "Real-time Updates",
      description: "Live train schedules and availability",
    },
    {
      icon: Shield,
      title: "Secure Booking",
      description: "Safe and encrypted transactions",
    },
    {
      icon: Ticket,
      title: "E-Tickets",
      description: "Instant digital tickets on confirmation",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent to-background">
      <Navbar user={user} />
      
      <main className="container mx-auto px-4 py-12">
        <section className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
            Book Your Railway Journey
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Fast, secure, and paperless railway ticket booking at your fingertips
          </p>
        </section>

        <section className="max-w-4xl mx-auto mb-16">
          <TrainSearchForm />
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Why Choose RailBook?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-6 text-center shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-[var(--transition-smooth)] bg-gradient-to-b from-card to-card/95"
              >
                <div className="inline-flex p-3 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 mb-4">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </section>

        <section className="text-center bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">Start Your Journey Today</h2>
          <p className="text-muted-foreground mb-6">
            Experience the future of railway booking with RailBook
          </p>
        </section>
      </main>
    </div>
  );
};

export default Index;

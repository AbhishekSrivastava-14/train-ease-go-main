import { Train, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NavbarProps {
  user: any;
}

const Navbar = ({ user }: NavbarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
      navigate("/auth");
    }
  };

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-primary/80">
            <Train className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">RailBook</span>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Button
                variant="ghost"
                onClick={() => navigate("/my-bookings")}
                className="gap-2"
              >
                <User className="h-4 w-4" />
                My Bookings
              </Button>
              <Button variant="outline" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <Button onClick={() => navigate("/auth")}>Login</Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
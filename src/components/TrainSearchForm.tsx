import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const TrainSearchForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    date: "",
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      from: formData.from,
      to: formData.to,
      date: formData.date,
    });
    navigate(`/trains?${params.toString()}`);
  };

  return (
    <Card className="p-6 shadow-[var(--shadow-card)] bg-gradient-to-b from-card to-card/95">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="from">From Station</Label>
            <Input
              id="from"
              placeholder="Enter departure station"
              value={formData.from}
              onChange={(e) =>
                setFormData({ ...formData, from: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="to">To Station</Label>
            <Input
              id="to"
              placeholder="Enter destination station"
              value={formData.to}
              onChange={(e) =>
                setFormData({ ...formData, to: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Journey Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full gap-2" size="lg">
          <Search className="h-5 w-5" />
          Search Trains
        </Button>
      </form>
    </Card>
  );
};

export default TrainSearchForm;
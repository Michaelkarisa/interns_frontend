import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/Layouts1/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/Layouts1/ui/avatar";
import PerformanceBadge from "@/Layouts/PerformanceBadge";
import RecommendationBadge from "@/Layouts/RecommendationBadge";
import { Button } from "@/Layouts1/ui/button";
import { User, ArrowRight } from "lucide-react";

const InternCard = ({ intern }) => {
  const navigate = useNavigate();

  const handleViewProfile = (id) => {
    navigate(`/interns/profile/${id}`);
  };

  return (
    <Card className="rounded-2xl shadow-sm border-0 overflow-hidden">
      <CardContent className="p-4 flex items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={intern?.passport_photo || undefined} />
          <AvatarFallback>{intern?.name?.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <h3 className="font-semibold">{intern.name}</h3>
          <p className="text-sm text-gray-600">{intern.position}</p>
        </div>

        <div className="flex flex-col items-end space-y-2">
          <PerformanceBadge score={intern.performance} />
          <RecommendationBadge isRecommended={intern.recommended} />

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewProfile(intern.id)}
            className="flex items-center space-x-1"
          >
            <User className="w-4 h-4" />
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InternCard;

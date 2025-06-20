
import { UserProfile } from "@/features/profile/types";
import { countries } from "@/lib/countries";

interface ProfileDisplayProps {
  profile: UserProfile | null;
}

const ProfileDisplay = ({ profile }: ProfileDisplayProps) => {
  if (!profile) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No profile information available
      </div>
    );
  }

  // Find the country name based on the country code
  const countryName = profile.country ? 
    countries.find(c => c.code === profile.country)?.name || profile.country : 
    "Not specified";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">First Name</h3>
          <p className="text-base">{profile.firstName || "Not specified"}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Last Name</h3>
          <p className="text-base">{profile.lastName || "Not specified"}</p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-1">Email Address</h3>
        <p className="text-base">{profile.email}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Country</h3>
          <p className="text-base">{countryName}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Phone Number</h3>
          <p className="text-base">{profile.phoneNumber || "Not specified"}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileDisplay;

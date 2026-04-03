import { useState } from "react";
import { useAuth, DEPARTMENTS, YEARS, SEMESTERS } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, User, Phone, BookOpen, GraduationCap, Building2, Award, Calendar, Users } from "lucide-react";
import { toast } from "sonner";
import collegeLogo from "@/assets/college-logo.png";

const ProfileSetupPage = () => {
  const { updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    registerNumber: "",
    mobile: "",
    department: "",
    section: "",
    year: "",
    semester: "",
    cgpa: "",
    classCoordinatorName: "",
  });

  const set = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));

  const mandatoryFields = [
    { key: "name", label: "Full Name", icon: User, type: "text", placeholder: "Enter your full name" },
    { key: "registerNumber", label: "Register Number", icon: GraduationCap, type: "text", placeholder: "e.g. 12345678" },
    { key: "mobile", label: "Mobile Number", icon: Phone, type: "tel", placeholder: "+91 9876543210" },
    { key: "department", label: "Department", icon: BookOpen, type: "select", options: DEPARTMENTS },
    { key: "section", label: "Section", icon: Building2, type: "text", placeholder: "e.g. A, B, C" },
    { key: "year", label: "Year", icon: Calendar, type: "select", options: YEARS },
    { key: "semester", label: "Semester", icon: Calendar, type: "select", options: SEMESTERS },
    { key: "cgpa", label: "CGPA", icon: Award, type: "number", placeholder: "e.g. 8.5" },
    { key: "classCoordinatorName", label: "Class Coordinator Name", icon: Users, type: "text", placeholder: "Enter coordinator's name" },
  ];

  const allFilled = mandatoryFields.every((f) => (form as any)[f.key]?.toString().trim());

  const handlePicture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePic(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!allFilled) {
      toast.error("Please fill all mandatory fields");
      return;
    }
    setIsLoading(true);
    try {
      await updateProfile({
        name: form.name,
        registerNumber: form.registerNumber,
        mobile: form.mobile,
        department: form.department,
        section: form.section,
        year: Number(form.year),
        semester: Number(form.semester),
        cgpa: Number(form.cgpa),
        classCoordinatorName: form.classCoordinatorName,
        profilePicture: profilePic,
        profileCompleted: true,
      });
      toast.success("Profile setup complete!");
      navigate("/dashboard");
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 pb-24">
      <div className="max-w-lg mx-auto space-y-5">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <img src={collegeLogo} alt="College" className="h-12 mx-auto mb-2 rounded" />
          <h1 className="text-lg sm:text-xl font-display font-bold gold-gradient-text">Complete Your Profile</h1>
          <p className="text-xs text-muted-foreground mt-1">All fields marked with <span className="text-destructive">*</span> are mandatory</p>
        </motion.div>

        {/* Profile Picture */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-4 text-center">
          <div className="relative w-20 h-20 mx-auto mb-2">
            {profilePic ? (
              <img src={profilePic} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-primary" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                <Camera size={24} />
              </div>
            )}
            <label className="absolute bottom-0 right-0 w-7 h-7 bg-primary rounded-full flex items-center justify-center cursor-pointer">
              <Camera size={14} className="text-primary-foreground" />
              <input type="file" accept="image/*" className="hidden" onChange={handlePicture} />
            </label>
          </div>
          <p className="text-xs text-muted-foreground">Profile picture (optional)</p>
        </motion.div>

        {/* Fields */}
        <div className="space-y-3">
          {mandatoryFields.map((field, i) => (
            <motion.div
              key={field.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass-card p-3"
            >
              <Label className="text-card-foreground text-sm flex items-center gap-1.5 mb-1.5">
                <field.icon size={14} className="text-primary" />
                {field.label}
                <span className="text-destructive text-xs">*</span>
              </Label>
              {field.type === "select" ? (
                <Select value={(form as any)[field.key]?.toString() || ""} onValueChange={(v) => set(field.key, v)}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder={`Select ${field.label.toLowerCase()}`} /></SelectTrigger>
                  <SelectContent>
                    {field.options?.map((opt) => (
                      <SelectItem key={String(opt)} value={String(opt)}>{String(opt)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={field.type}
                  value={(form as any)[field.key]}
                  onChange={(e) => set(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="h-9 text-sm"
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={!allFilled || isLoading}
          className="w-full bg-primary text-primary-foreground hover:bg-accent font-semibold text-base py-5"
        >
          {isLoading ? "Saving..." : "Complete Setup & Continue"}
        </Button>
      </div>
    </div>
  );
};

export default ProfileSetupPage;

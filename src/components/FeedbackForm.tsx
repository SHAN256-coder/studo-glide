import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AlertTriangle, ImagePlus, Send, X } from "lucide-react";
import { toast } from "sonner";

const ISSUE_TYPES = [
  "Classroom / Furniture",
  "Restroom / Hygiene",
  "Drinking Water",
  "Canteen / Food",
  "Hostel Issue",
  "Transport / Bus",
  "Wi-Fi / Network",
  "Electrical / Lighting",
  "Lab / Equipment",
  "Safety / Security",
  "Cleanliness",
  "Other",
];

const LOCATIONS = [
  "Main Block",
  "SIPH Block",
  "Hostel",
  "Canteen",
  "Library",
  "Lab",
  "Ground / Sports Area",
  "Bus / Transport",
  "Restroom",
  "Other",
];

const PRIORITY = ["Low", "Medium", "High", "Urgent"];

const Required = () => <span className="text-destructive ml-0.5">*</span>;

const FeedbackForm = ({ onClose }: { onClose: () => void }) => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState((user as any)?.email || "");
  const [issueType, setIssueType] = useState("");
  const [location, setLocation] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    setImageFile(f);
    const r = new FileReader();
    r.onloadend = () => setImagePreview(r.result as string);
    r.readAsDataURL(f);
  };

  const submit = async () => {
    if (!name.trim() || !email.trim() || !issueType || !location || !subject.trim() || !message.trim()) {
      toast.error("Please fill all required fields");
      return;
    }
    if (!user?.id) { toast.error("Please sign in"); return; }
    setSubmitting(true);
    try {
      let imageUrl: string | null = null;
      if (imageFile) {
        const ext = imageFile.name.split(".").pop() || "png";
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("feedback-images").upload(path, imageFile, { upsert: false });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("feedback-images").getPublicUrl(path);
        imageUrl = pub.publicUrl;
      }

      const priorityToRating: Record<string, number> = { Low: 1, Medium: 2, High: 3, Urgent: 4 };
      const { error } = await supabase.from("feedbacks" as any).insert({
        user_id: user.id,
        name: name.trim(),
        email: email.trim(),
        category: `${issueType} • ${location}`,
        subject: subject.trim(),
        message: `[Priority: ${priority}]\n${message.trim()}`,
        rating: priorityToRating[priority] ?? 2,
        image_url: imageUrl,
      });
      if (error) throw error;
      toast.success("Issue submitted. The campus team will review your request.");
      onClose();
    } catch (e: any) {
      toast.error(e?.message || "Failed to submit issue");
    } finally { setSubmitting(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} className="text-primary" />
          <h3 className="text-base font-semibold text-card-foreground">Report a College Issue</h3>
        </div>
        <Button size="icon" variant="ghost" onClick={onClose} className="h-7 w-7"><X size={14} /></Button>
      </div>
      <p className="text-xs text-muted-foreground -mt-2">
        Facing an inconvenience inside the college? Fill the details below — your request will be sent to the campus team.
      </p>

      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Name<Required /></Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <Label className="text-xs">Email<Required /></Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Issue Type<Required /></Label>
            <Select value={issueType} onValueChange={setIssueType}>
              <SelectTrigger><SelectValue placeholder="Select issue type" /></SelectTrigger>
              <SelectContent>{ISSUE_TYPES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Location<Required /></Label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger><SelectValue placeholder="Where is the issue?" /></SelectTrigger>
              <SelectContent>{LOCATIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-xs">Priority<Required /></Label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{PRIORITY.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Subject<Required /></Label>
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Short summary of the issue" />
        </div>
        <div>
          <Label className="text-xs">Describe the Issue<Required /></Label>
          <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Explain the inconvenience in detail" rows={4} />
        </div>
        <div>
          <Label className="text-xs">Photo (optional)</Label>
          <label className="mt-1 flex items-center gap-2 p-3 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50">
            <ImagePlus size={18} className="text-primary" />
            <span className="text-xs text-muted-foreground">{imageFile ? imageFile.name : "Attach a photo if available (max 5MB)"}</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
          </label>
          {imagePreview && <img src={imagePreview} alt="preview" className="mt-2 max-h-40 rounded-lg border border-border" />}
        </div>
      </div>

      <Button onClick={submit} disabled={submitting} className="w-full gap-2">
        <Send size={14} /> {submitting ? "Submitting..." : "Submit Issue"}
      </Button>
    </motion.div>
  );
};

export default FeedbackForm;

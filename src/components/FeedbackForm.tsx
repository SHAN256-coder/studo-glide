import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ImagePlus, Send, Star, X } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = ["Bug Report", "Feature Request", "UI/UX", "Performance", "Other"];
const Required = () => <span className="text-destructive ml-0.5">*</span>;

const FeedbackForm = ({ onClose }: { onClose: () => void }) => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
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
    if (!name.trim() || !email.trim() || !category || !subject.trim() || !message.trim() || !imageFile) {
      toast.error("Please fill all required fields and attach an image");
      return;
    }
    if (!user?.id) { toast.error("Please sign in"); return; }
    setSubmitting(true);
    try {
      // Upload image
      const ext = imageFile.name.split(".").pop() || "png";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("feedback-images").upload(path, imageFile, { upsert: false });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("feedback-images").getPublicUrl(path);

      const { error } = await supabase.from("feedbacks" as any).insert({
        user_id: user.id, name: name.trim(), email: email.trim(),
        category, subject: subject.trim(), message: message.trim(),
        rating, image_url: pub.publicUrl,
      });
      if (error) throw error;
      toast.success("Feedback submitted. Thank you!");
      onClose();
    } catch (e: any) {
      toast.error(e?.message || "Failed to submit feedback");
    } finally { setSubmitting(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-card-foreground">Submit Feedback</h3>
        <Button size="icon" variant="ghost" onClick={onClose} className="h-7 w-7"><X size={14} /></Button>
      </div>

      <div className="space-y-3">
        <div>
          <Label className="text-xs">Name<Required /></Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        </div>
        <div>
          <Label className="text-xs">Email<Required /></Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div>
          <Label className="text-xs">Category<Required /></Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
            <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Subject<Required /></Label>
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Short summary" />
        </div>
        <div>
          <Label className="text-xs">Message<Required /></Label>
          <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe your feedback in detail" rows={4} />
        </div>
        <div>
          <Label className="text-xs">Rating<Required /></Label>
          <div className="flex gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setRating(n)} className="p-0.5">
                <Star size={22} className={n <= rating ? "fill-primary text-primary" : "text-muted-foreground"} />
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label className="text-xs">Screenshot / Image<Required /></Label>
          <label className="mt-1 flex items-center gap-2 p-3 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50">
            <ImagePlus size={18} className="text-primary" />
            <span className="text-xs text-muted-foreground">{imageFile ? imageFile.name : "Click to upload (required, max 5MB)"}</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
          </label>
          {imagePreview && <img src={imagePreview} alt="preview" className="mt-2 max-h-40 rounded-lg border border-border" />}
        </div>
      </div>

      <Button onClick={submit} disabled={submitting} className="w-full gap-2">
        <Send size={14} /> {submitting ? "Submitting..." : "Submit Feedback"}
      </Button>
    </motion.div>
  );
};

export default FeedbackForm;

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const phone = typeof body?.phone === "string" ? body.phone.trim() : "";

    if (!phone || !phone.startsWith("+") || phone.length < 8) {
      return new Response(
        JSON.stringify({ error: "Enter mobile in international format (e.g. +919876543210)." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceRole);

    // 1. Verify a profile exists with this mobile (server-side, bypasses RLS)
    const { data: profile, error: profileErr } = await admin
      .from("profiles")
      .select("id, mobile")
      .eq("mobile", phone)
      .maybeSingle();

    if (profileErr) {
      return new Response(
        JSON.stringify({ error: "Lookup failed. Try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!profile) {
      // Generic message to avoid revealing which numbers are registered
      return new Response(
        JSON.stringify({ error: "No account found with this mobile number." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 2. Send OTP via Supabase Auth (uses configured SMS provider)
    const { error: otpErr } = await admin.auth.signInWithOtp({
      phone,
      options: { shouldCreateUser: false },
    });

    if (otpErr) {
      return new Response(
        JSON.stringify({ error: otpErr.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ ok: true, message: "OTP sent." }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

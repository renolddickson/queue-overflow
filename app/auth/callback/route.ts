import { createClient } from "@/utils/supabase"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  // if "next" is in param, use it as the redirection URL
  const next = searchParams.get("next") ?? "/feed"

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data?.user) {
      const { recordSession } = await import('@/actions/sessions');
      await recordSession(data.user.id);

      // Check if user has a username
      const { data: profile } = await supabase
        .from('users')
        .select('user_name')
        .eq('user_id', data.user.id)
        .single();

      if (!profile?.user_name) {
        return NextResponse.redirect(`${origin}/profile?setup=true`);
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}

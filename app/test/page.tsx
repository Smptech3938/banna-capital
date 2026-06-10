import { supabase } from '@/lib/supabase'

export default async function TestPage() {
  let status = 'Unknown'
  let error: string | null = null

  try {
    // A simple query to verify the connection is alive
    const { error: supaError } = await supabase.from('_test_connection').select('*').limit(1)

    // A "relation does not exist" error still means Supabase connected fine —
    // the table just doesn't exist yet, which is expected.
    if (supaError && !supaError.message.includes('does not exist') && !supaError.message.includes('Could not find')) {
      status = 'Error'
      error = supaError.message
    } else {
      status = 'Connected'
    }
  } catch (e) {
    status = 'Error'
    error = e instanceof Error ? e.message : 'Unknown error'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-semibold">
          {status === 'Connected'
            ? 'Supabase Connected Successfully 🚀'
            : 'Supabase Connection Failed ❌'}
        </h1>
        {error && (
          <p className="text-red-500 text-sm max-w-md mx-auto">
            Error: {error}
          </p>
        )}
        <p className="text-zinc-500 text-sm">
          URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Loaded' : '❌ Missing'}
        </p>
        <p className="text-zinc-500 text-sm">
          Anon Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Loaded' : '❌ Missing'}
        </p>
      </div>
    </div>
  )
}
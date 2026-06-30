import { User, Mail, Phone, Shield, Calendar } from 'lucide-react';
import { createSupabaseServer } from '@/lib/supabase-server';
import { formatDate } from '@/lib/format';

export const metadata = {
  title: 'My Profile — Banna Capital',
  description: 'View and manage your investor profile.',
};

export default async function ProfilePage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profileName = 'Investor';
  let profilePhone = '';
  let profileRole = 'investor';
  let profileCreatedAt = '';
  let email = '';

  if (user) {
    email = user.email ?? '';

    const { data: profile } = await supabase
      .from('profiles')
      .select('name, phone, role, created_at')
      .eq('id', user.id)
      .single();

    if (profile) {
      profileName = profile.name;
      profilePhone = profile.phone ?? '';
      profileRole = profile.role ?? 'investor';
      profileCreatedAt = profile.created_at;
    }
  }

  const initials = profileName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <User className="h-5 w-5 text-emerald-400" />
          My Profile
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Your account information
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile card */}
        <div className="lg:col-span-1 flex flex-col items-center rounded-xl border border-white/5 bg-zinc-900/50 p-8 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600/30 to-emerald-400/10 ring-2 ring-emerald-500/30">
            <span className="text-2xl font-bold text-emerald-400">{initials}</span>
          </div>
          <h3 className="mt-4 text-lg font-bold text-white">{profileName}</h3>
          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400 capitalize">
            <Shield className="h-3 w-3" />
            {profileRole}
          </span>
          {profileCreatedAt && (
            <p className="mt-3 text-xs text-zinc-500">
              Member since {formatDate(profileCreatedAt)}
            </p>
          )}
        </div>

        {/* Details card */}
        <div className="lg:col-span-2 rounded-xl border border-white/5 bg-zinc-900/50 p-6">
          <h3 className="text-sm font-semibold text-white mb-5">Account Details</h3>
          <div className="space-y-5">
            <ProfileField icon={User} label="Full Name" value={profileName} />
            <ProfileField icon={Mail} label="Email Address" value={email} />
            <ProfileField icon={Phone} label="Phone Number" value={profilePhone || 'Not provided'} />
            <ProfileField icon={Shield} label="Account Type" value={profileRole.charAt(0).toUpperCase() + profileRole.slice(1)} />
            {profileCreatedAt && (
              <ProfileField icon={Calendar} label="Joined" value={formatDate(profileCreatedAt)} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function ProfileField({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-800/50 ring-1 ring-white/5">
        <Icon className="h-4 w-4 text-zinc-400" />
      </div>
      <div>
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-white">{value}</p>
      </div>
    </div>
  );
}

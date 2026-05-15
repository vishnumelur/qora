import { redirect } from 'next/navigation';

// This deployment is the internal admin studio only — there is no public
// marketing site. Send the root straight to the admin.
export default function RootPage() {
  redirect('/admin');
}

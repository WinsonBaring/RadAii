import { supabase } from '@/lib/supabase';

export default async function Users() {
  const { data: users, error } = await supabase.from("Users").select();

  if (error) {
    return <div className="p-4 text-red-500">Error: {error.message}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-auto">
        {JSON.stringify(users)}
      </pre>
    </div>
  );
}
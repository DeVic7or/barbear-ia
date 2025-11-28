import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.86.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserWithRole {
  id: string;
  email: string;
  created_at: string;
  roles: { role: string }[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting get-users function');

    // Create Supabase client with service role key for admin access
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Create regular client to verify the requesting user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header');
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User authenticated:', user.id);

    // Check if user is a gerente or admin
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (rolesError) {
      console.error('Error checking roles:', rolesError);
      return new Response(
        JSON.stringify({ error: 'Erro ao verificar permissões' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isGerenteOrAdmin = userRoles?.some(
      (r) => r.role === 'gerente' || r.role === 'admin'
    );

    if (!isGerenteOrAdmin) {
      console.error('User is not gerente or admin');
      return new Response(
        JSON.stringify({ error: 'Permissão negada' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User has permission, fetching users');

    // Get all users from auth.users using admin client
    const { data: authUsers, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar usuários' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetched auth users:', authUsers.users.length);

    // Get all user roles
    const { data: allRoles, error: allRolesError } = await supabase
      .from('user_roles')
      .select('user_id, role');

    if (allRolesError) {
      console.error('Error fetching all roles:', allRolesError);
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar papéis dos usuários' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetched all roles:', allRoles?.length);

    // Map roles by user_id for efficient lookup
    const rolesByUser = new Map<string, { role: string }[]>();
    allRoles?.forEach((role) => {
      if (!rolesByUser.has(role.user_id)) {
        rolesByUser.set(role.user_id, []);
      }
      rolesByUser.get(role.user_id)!.push({ role: role.role });
    });

    // Combine auth users with their roles
    const usersWithRoles: UserWithRole[] = authUsers.users.map((authUser) => ({
      id: authUser.id,
      email: authUser.email || 'Sem email',
      created_at: authUser.created_at,
      roles: rolesByUser.get(authUser.id) || [],
    }));

    console.log('Successfully prepared users with roles:', usersWithRoles.length);

    return new Response(
      JSON.stringify({ users: usersWithRoles }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

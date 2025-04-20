-- Create users table
CREATE TABLE IF NOT EXISTS public.user (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create images table
CREATE TABLE IF NOT EXISTS public.images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    original_url TEXT NOT NULL,
    processed_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_email ON public.user(email);
CREATE INDEX IF NOT EXISTS idx_images_created_at ON public.images(created_at);

-- Set up Row Level Security (RLS)
ALTER TABLE public.user ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own data" ON public.user
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON public.user
    FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Anyone can view images" ON public.images
    FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert images" ON public.images
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Add comments
COMMENT ON TABLE public.user IS 'Stores user information for the RADAI application';
COMMENT ON TABLE public.images IS 'Stores image information including original and processed URLs'; 
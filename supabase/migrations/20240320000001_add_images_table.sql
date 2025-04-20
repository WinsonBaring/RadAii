-- Create images table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.images (
    id UUID PRIMARY KEY,
    original_url TEXT NOT NULL,
    processed_url TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_images_created_at ON public.images(created_at);
CREATE INDEX IF NOT EXISTS idx_images_user_id ON public.images(user_id);

-- Set up Row Level Security (RLS)
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own images" ON public.images
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own images" ON public.images
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own images" ON public.images
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own images" ON public.images
    FOR DELETE
    USING (auth.uid() = user_id);

-- Add comments
COMMENT ON TABLE public.images IS 'Stores image information including original and processed URLs';
COMMENT ON COLUMN public.images.user_id IS 'References the user who uploaded the image'; 
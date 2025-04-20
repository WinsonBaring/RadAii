export type ImageRecord = {
  id: string;
  original_url: string;
  processed_url: string;
  created_at: string;
};

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  created_at: string;
  // Add other fields that exist in your user table
};

export type Database = {
  public: {
    Tables: {
      images: {
        Row: ImageRecord;
        Insert: Omit<ImageRecord, 'id' | 'created_at'>;
        Update: Partial<Omit<ImageRecord, 'id' | 'created_at'>>;
      };
      user: {
        Row: UserRecord;
        Insert: Omit<UserRecord, 'id' | 'created_at'>;
        Update: Partial<Omit<UserRecord, 'id' | 'created_at'>>;
      };
    };
  };
}; 
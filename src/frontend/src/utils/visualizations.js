import supabase from './supabase';

// Get all visualizations for the current user
export const getUserVisualizations = async (page = 1, pageSize = 10) => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const { data, error, count } = await supabase
    .from('saved_visualizations')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(start, end);

  return { data, error, count, page, pageSize };
};

// Get public visualizations
export const getPublicVisualizations = async (page = 1, pageSize = 10) => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const { data, error, count } = await supabase
    .from('saved_visualizations')
    .select('*, profiles(display_name)', { count: 'exact' })
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .range(start, end);

  return { data, error, count, page, pageSize };
};

// Get a specific visualization by ID
export const getVisualization = async (id) => {
  const { data, error } = await supabase
    .from('saved_visualizations')
    .select('*, profiles(display_name)')
    .eq('id', id)
    .single();

  return { data, error };
};

// Create a new visualization
export const createVisualization = async (visualizationData) => {
  const { data, error } = await supabase
    .from('saved_visualizations')
    .insert(visualizationData)
    .select()
    .single();

  return { data, error };
};

// Update an existing visualization
export const updateVisualization = async (id, updates) => {
  const { data, error } = await supabase
    .from('saved_visualizations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
};

// Delete a visualization
export const deleteVisualization = async (id) => {
  const { error } = await supabase
    .from('saved_visualizations')
    .delete()
    .eq('id', id);

  return { error };
};

// Search visualizations by title or description
export const searchVisualizations = async (query, page = 1, pageSize = 10) => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const { data, error, count } = await supabase
    .from('saved_visualizations')
    .select('*', { count: 'exact' })
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .range(start, end);

  return { data, error, count, page, pageSize };
};

// Filter visualizations by type
export const filterVisualizationsByType = async (type, page = 1, pageSize = 10) => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const { data, error, count } = await supabase
    .from('saved_visualizations')
    .select('*', { count: 'exact' })
    .eq('visualization_type', type)
    .order('created_at', { ascending: false })
    .range(start, end);

  return { data, error, count, page, pageSize };
};

// Upload a visualization thumbnail
export const uploadThumbnail = async (file, visualizationId) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${visualizationId}.${fileExt}`;
  const filePath = `visualization_thumbnails/${fileName}`;

  const { data, error } = await supabase.storage
    .from('visualizations')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    return { data: null, error };
  }

  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from('visualizations')
    .getPublicUrl(filePath);

  // Update the visualization with the thumbnail URL
  const { data: updatedVisualization, error: updateError } = await updateVisualization(
    visualizationId,
    { thumbnail_url: publicUrl }
  );

  return { data: updatedVisualization, error: updateError };
};

// Save the current visualization state
export const saveVisualization = async (title, description, visualizationType, parameters, isPublic = false) => {
  // Create the visualization record
  const visualizationData = {
    title,
    description,
    visualization_type: visualizationType,
    parameters,
    is_public: isPublic,
  };

  const { data, error } = await createVisualization(visualizationData);

  return { data, error };
};

// Generate a thumbnail from canvas
export const generateThumbnail = async (canvas, visualizationId) => {
  // Convert canvas to blob
  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      // Create a file from the blob
      const file = new File([blob], `thumbnail-${visualizationId}.png`, { type: 'image/png' });
      
      // Upload the file
      const result = await uploadThumbnail(file, visualizationId);
      resolve(result);
    }, 'image/png');
  });
}; 
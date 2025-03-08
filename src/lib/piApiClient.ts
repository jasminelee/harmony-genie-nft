/**
 * PiAPI Client
 * 
 * This file provides utilities for interacting with the PiAPI
 * to generate music using Suno.
 */

// PiAPI configuration
const PIAPI_BASE_URL = 'https://api.piapi.ai/api/v1'; // Direct API URL
const PIAPI_API_KEY = '174901617cf23f0b9c816de08d678a4a3af67d5a9a54ff31a936e3e694a85176';

// Task status types
export enum TaskStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

// Task response interface
export interface PiApiTaskResponse {
  task_id: string;
  status: TaskStatus;
  output?: {
    audio_url?: string;
    lyrics?: string;
    title?: string;
    tags?: string[];
  };
  error?: string;
}

/**
 * Create a music generation task
 * @param prompt - The description of the music to generate
 * @param options - Additional options for music generation
 * @returns Promise with the task ID
 */
export async function createMusicGenerationTask(
  prompt: string,
  options: {
    model?: 'music-s' | 'music-u';
    negative_tags?: string;
    tags?: string;
    title?: string;
    make_instrumental?: boolean;
    lyrics_type?: 'generate' | 'user' | 'instrumental';
  } = {}
): Promise<string> {
  try {
    console.log('Creating music generation task with prompt:', prompt);
    
    // According to PiAPI docs, the endpoint is /api/v1/task
    const requestBody = {
      model: options.model || 'music-s', // Default to Suno
      task_type: 'generate_music',
      input: {
        gpt_description_prompt: prompt,
        negative_tags: options.negative_tags || '',
        tags: options.tags || '',
        title: options.title || '',
        make_instrumental: options.make_instrumental === true, // Ensure boolean
        lyrics_type: options.lyrics_type || 'generate'
      }
    };
    
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    const url = `${PIAPI_BASE_URL}/task`;
    console.log('Create task URL:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': PIAPI_API_KEY
      },
      body: JSON.stringify(requestBody),
      mode: 'cors'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response from PiAPI:`, response.status, response.statusText, errorText);
      throw new Error(`PiAPI error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('PiAPI task created response:', data);
    
    // Extract the task ID from the response
    let taskId = null;
    
    // Check if task_id is directly in the response
    if (data.task_id) {
      taskId = data.task_id;
    } 
    // Check if it's in the data object
    else if (data.data && data.data.task_id) {
      taskId = data.data.task_id;
    }
    // Check if it's in the task object
    else if (data.task && data.task.task_id) {
      taskId = data.task.task_id;
    }
    // Check if it's in the output object
    else if (data.output && data.output.task_id) {
      taskId = data.output.task_id;
    }
    // Try to find it recursively in the response
    else if (data && typeof data === 'object') {
      // Try to find the task_id in nested objects
      const findTaskId = (obj: any): string | null => {
        for (const key in obj) {
          if (key === 'task_id' && typeof obj[key] === 'string') {
            return obj[key];
          } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            const found = findTaskId(obj[key]);
            if (found) return found;
          }
        }
        return null;
      };
      
      taskId = findTaskId(data);
    }
    
    if (!taskId) {
      console.error('No task ID found in response:', data);
      throw new Error('No task ID returned from PiAPI');
    }
    
    console.log(`Successfully created task with ID: ${taskId}`);
    return taskId;
  } catch (error) {
    console.error('Error creating music generation task:', error);
    throw error;
  }
}

/**
 * Check the status of a music generation task
 * @param taskId - The task ID to check
 * @returns Promise with the task status and output
 */
export async function checkTaskStatus(taskId: string): Promise<PiApiTaskResponse> {
  try {    
    // Make sure we're using the full task ID in the URL
    // According to PiAPI docs, the endpoint is /api/v1/task?task_id=TASK_ID
    const url = `${PIAPI_BASE_URL}/task/${taskId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': PIAPI_API_KEY
      },
      mode: 'cors'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response for task ${taskId}:`, response.status, response.statusText, errorText);
      
      // If we get a 404, it might be because the task hasn't been created yet or the API is having issues
      if (response.status === 404) {
        console.log(`Task ${taskId} not found, returning pending status`);
        return {
          task_id: taskId,
          status: TaskStatus.PENDING,
          error: `Task not found: ${errorText}`
        };
      }
      
      throw new Error(`PiAPI error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    // Get the raw response text first for debugging
    const responseText = await response.text();
    
    // Parse the response
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (error) {
      console.error(`Error parsing JSON response for task ${taskId}:`, error);
      return {
        task_id: taskId,
        status: TaskStatus.PENDING,
        error: `Error parsing response: ${error.message}`
      };
    }
        
    // Handle the case where the response is just a success message
    if (data.message === 'success' && !data.status && !data.data) {
      console.log(`Task ${taskId} returned success but no status, returning pending status`);
      return {
        task_id: taskId,
        status: TaskStatus.PENDING,
        error: null
      };
    }
    
    // Handle the standard response format with data property
    if (data.code === 200 && data.data) {
      const taskData = data.data;
      console.log(`Found task data:`, taskData);
      
      // Check if the task is completed and has clips
      if (taskData.status === 'completed' && taskData.output && taskData.output.clips) {
        // Extract the first clip's audio URL
        const clipIds = Object.keys(taskData.output.clips);
        if (clipIds.length > 0) {
          const firstClipId = clipIds[0];
          const clip = taskData.output.clips[firstClipId];
          
          console.log(`Found clip with ID ${firstClipId}:`, clip);
          
          return {
            task_id: taskData.task_id,
            status: TaskStatus.COMPLETED,
            output: {
              audio_url: clip.audio_url,
              title: clip.title || 'Generated Song',
              lyrics: '', // Suno doesn't provide lyrics in the response
              tags: clip.metadata?.tags?.split(',') || []
            }
          };
        }
      }
      
      // Return the task status even if it's not completed or doesn't have clips
      return {
        task_id: taskData.task_id,
        status: mapStatusString(taskData.status),
        output: taskData.output || null,
        error: taskData.error?.message || taskData.error || null
      };
    }
    
    // Handle the case where the task is directly in the response
    if (data.task_id && data.status) {
      return {
        task_id: data.task_id,
        status: mapStatusString(data.status),
        output: data.output || null,
        error: data.error?.message || data.error || null
      };
    }
    
    // If we get here, we don't recognize the response format
    console.warn(`Unexpected response format for task ${taskId}:`, data);
    
    // Try to extract task_id and status from the response
    const extractedTaskId = extractTaskId(data);
    const extractedStatus = extractStatus(data);
    
    if (extractedTaskId && extractedStatus) {
      console.log(`Extracted task_id: ${extractedTaskId}, status: ${extractedStatus}`);
      return {
        task_id: extractedTaskId,
        status: mapStatusString(extractedStatus),
        output: extractOutput(data),
        error: extractError(data)
      };
    }
    
    // If all else fails, return a pending status
    return {
      task_id: taskId,
      status: TaskStatus.PENDING,
      error: 'Unexpected response format'
    };
  } catch (error) {
    console.error(`Error checking task status for ${taskId}:`, error);
    // Return a pending status instead of throwing an error to allow polling to continue
    return {
      task_id: taskId,
      status: TaskStatus.PENDING,
      error: error.message
    };
  }
}

/**
 * Map a status string to a TaskStatus enum value
 */
function mapStatusString(status: string): TaskStatus {
  switch (status.toLowerCase()) {
    case 'pending':
      return TaskStatus.PENDING;
    case 'processing':
      return TaskStatus.PROCESSING;
    case 'completed':
      return TaskStatus.COMPLETED;
    case 'failed':
      return TaskStatus.FAILED;
    default:
      console.warn(`Unknown status: ${status}, defaulting to PENDING`);
      return TaskStatus.PENDING;
  }
}

/**
 * Extract task_id from a response object
 */
function extractTaskId(data: any): string | null {
  // Check for data.task_id format
  if (data.data?.task_id) return data.data.task_id;
  
  // Check for direct task_id
  if (data.task_id) return data.task_id;
  
  // Check for other formats
  if (data.task?.task_id) return data.task.task_id;
  if (data.output?.task_id) return data.output.task_id;
  
  // Try to find it recursively
  const findTaskId = (obj: any): string | null => {
    if (!obj || typeof obj !== 'object') return null;
    
    for (const key in obj) {
      if (key === 'task_id' && typeof obj[key] === 'string') {
        return obj[key];
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        const found = findTaskId(obj[key]);
        if (found) return found;
      }
    }
    return null;
  };
  
  return findTaskId(data);
}

/**
 * Extract status from a response object
 */
function extractStatus(data: any): string | null {
  // Check for data.status format
  if (data.data?.status) return data.data.status;
  
  // Check for direct status
  if (data.status) return data.status;
  
  // Check for other formats
  if (data.task?.status) return data.task.status;
  
  // Try to find it recursively
  const findStatus = (obj: any): string | null => {
    if (!obj || typeof obj !== 'object') return null;
    
    for (const key in obj) {
      if (key === 'status' && typeof obj[key] === 'string') {
        return obj[key];
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        const found = findStatus(obj[key]);
        if (found) return found;
      }
    }
    return null;
  };
  
  return findStatus(data);
}

/**
 * Extract output from a response object
 */
function extractOutput(data: any): any {
  // Check for data.output.clips format
  if (data.data?.output?.clips) {
    const clipIds = Object.keys(data.data.output.clips);
    if (clipIds.length > 0) {
      const firstClipId = clipIds[0];
      const clip = data.data.output.clips[firstClipId];
      return {
        audio_url: clip.audio_url,
        title: clip.title || 'Generated Song',
        lyrics: '',
        tags: clip.metadata?.tags?.split(',') || []
      };
    }
  }
  
  // Check for direct output.clips format
  if (data.output?.clips) {
    const clipIds = Object.keys(data.output.clips);
    if (clipIds.length > 0) {
      const firstClipId = clipIds[0];
      const clip = data.output.clips[firstClipId];
      return {
        audio_url: clip.audio_url,
        title: clip.title || 'Generated Song',
        lyrics: '',
        tags: clip.metadata?.tags?.split(',') || []
      };
    }
  }
  
  // Check for standard output properties
  if (data.output) return data.output;
  if (data.data?.output) return data.data.output;
  if (data.task?.output) return data.task.output;
  
  return null;
}

/**
 * Extract error from a response object
 */
function extractError(data: any): string | null {
  if (data.error?.message) return data.error.message;
  if (data.error) return data.error;
  if (data.data?.error?.message) return data.data.error.message;
  if (data.data?.error) return data.data.error;
  if (data.task?.error?.message) return data.task.error.message;
  if (data.task?.error) return data.task.error;
  
  return null;
}

/**
 * Wait for a music generation task to complete
 * @param taskId - The task ID to wait for
 * @param maxAttempts - Maximum number of attempts to check status
 * @param delayMs - Delay between status checks in milliseconds
 * @returns Promise with the completed task
 */
export async function waitForTaskCompletion(
  taskId: string,
  maxAttempts: number = 60,
  delayMs: number = 5000
): Promise<PiApiTaskResponse> {
  let attempts = 0;
  
  const checkStatus = async (): Promise<PiApiTaskResponse> => {
    attempts++;
    
    if (attempts > maxAttempts) {
      throw new Error(`Task ${taskId} did not complete within the allowed time`);
    }
    
    const taskStatus = await checkTaskStatus(taskId);
    
    if (taskStatus.status === TaskStatus.COMPLETED) {
      return taskStatus;
    } else if (taskStatus.status === TaskStatus.FAILED) {
      throw new Error(`Task ${taskId} failed: ${taskStatus.error || 'Unknown error'}`);
    } else {
      // Task is still pending or processing, wait and check again
      await new Promise(resolve => setTimeout(resolve, delayMs));
      return checkStatus();
    }
  };
  
  return checkStatus();
}

/**
 * Generate music using PiAPI
 * @param prompt - The description of the music to generate
 * @param options - Additional options for music generation
 * @returns Promise with the generated music URL and metadata
 */
export async function generateMusic(
  prompt: string,
  options: {
    model?: 'music-s' | 'music-u';
    negative_tags?: string;
    tags?: string;
    title?: string;
    make_instrumental?: boolean;
    lyrics_type?: 'generate' | 'user' | 'instrumental';
    onStatusUpdate?: (status: string) => void;
  } = {}
): Promise<{
  url: string;
  title: string;
  lyrics?: string;
  tags?: string[];
}> {
  try {
    // Log the options being used
    console.log('Generating music with options:', {
      prompt,
      model: options.model || 'music-s',
      negative_tags: options.negative_tags || '',
      tags: options.tags || '',
      title: options.title || '',
      make_instrumental: options.make_instrumental || false,
      lyrics_type: options.lyrics_type || 'generate'
    });
    
    // Create the task
    const taskId = await createMusicGenerationTask(prompt, options);
    
    if (options.onStatusUpdate) {
      options.onStatusUpdate(`Task created: ${taskId}`);
    }
    
    // Wait for the task to complete
    let currentStatus = '';
    let retryCount = 0;
    const maxRetries = 5;
    
    const updateStatus = async (): Promise<PiApiTaskResponse> => {
      try {
        // Add a small delay before the first status check
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const taskStatus = await checkTaskStatus(taskId);
        
        if (taskStatus.status !== currentStatus) {
          currentStatus = taskStatus.status;
          if (options.onStatusUpdate) {
            options.onStatusUpdate(`Music generation ${currentStatus}...`);
          }
        }
        
        if (taskStatus.status === TaskStatus.COMPLETED) {
          return taskStatus;
        } else if (taskStatus.status === TaskStatus.FAILED) {
          throw new Error(`Task ${taskId} failed: ${taskStatus.error || 'Unknown error'}`);
        } else {
          // Task is still pending or processing, wait and check again
          await new Promise(resolve => setTimeout(resolve, 5000));
          return updateStatus();
        }
      } catch (error) {
        console.error(`Error checking status for task ${taskId}:`, error);
        
        // Retry a few times before giving up
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying status check (${retryCount}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, 5000));
          return updateStatus();
        }
        
        throw error;
      }
    };
    
    const completedTask = await updateStatus();
    
    if (!completedTask.output || !completedTask.output.audio_url) {
      throw new Error('No audio URL in completed task');
    }
    
    return {
      url: completedTask.output.audio_url,
      title: completedTask.output.title || 'Generated Song',
      lyrics: completedTask.output.lyrics,
      tags: completedTask.output.tags
    };
  } catch (error) {
    console.error('Error generating music:', error);
    throw error;
  }
}

/**
 * Extract music generation parameters from a user prompt
 * @param prompt - The user's prompt
 * @returns Object with extracted parameters
 */
export function extractMusicParameters(prompt: string): {
  genre?: string;
  mood?: string;
  instrumental?: boolean;
  tags?: string[];
} {
  const result: {
    genre?: string;
    mood?: string;
    instrumental?: boolean;
    tags?: string[];
  } = {};
  
  // Extract genre
  const genreMatch = prompt.match(/genre:?\s*([a-zA-Z0-9 &-]+)/i) || 
                    prompt.match(/([a-zA-Z]+)\s+music/i) ||
                    prompt.match(/([a-zA-Z]+)\s+song/i);
  if (genreMatch && genreMatch[1]) {
    result.genre = genreMatch[1].trim();
  }
  
  // Extract mood
  const moodMatch = prompt.match(/mood:?\s*([a-zA-Z0-9 ]+)/i) || 
                   prompt.match(/feeling:?\s*([a-zA-Z0-9 ]+)/i) ||
                   prompt.match(/([a-zA-Z]+)\s+vibe/i);
  if (moodMatch && moodMatch[1]) {
    result.mood = moodMatch[1].trim();
  }
  
  // Check if instrumental
  result.instrumental = /instrumental|no vocals|without vocals|no singing|without singing/i.test(prompt);
  
  // Extract potential tags
  const commonTags = [
    'pop', 'rock', 'jazz', 'hip hop', 'rap', 'electronic', 'dance', 'ambient',
      'lo-fi', 'classical', 'folk', 'country', 'r&b', 'soul', 'funk', 'metal',
      'punk', 'indie', 'blues', 'reggae', 'disco', 'techno', 'house', 'trance',
      'dubstep', 'trap', 'edm', 'orchestral', 'cinematic', 'acoustic', 'vocal',
      'upbeat', 'sad', 'happy', 'energetic', 'calm', 'relaxing', 'intense',
      'emotional', 'dark', 'bright', 'dreamy', 'nostalgic', 'futuristic'
  ];
  
  result.tags = commonTags.filter(tag => 
    new RegExp(`\\b${tag}\\b`, 'i').test(prompt)
  );
  
  return result;
}
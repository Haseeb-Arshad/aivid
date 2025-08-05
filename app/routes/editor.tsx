import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useActionData, useFetcher, useRevalidator } from "@remix-run/react";
import { useEffect, useState } from "react";
import { VideoEditor } from "~/components/VideoEditor";
import { AuthProvider } from "~/lib/auth-context";
import { apiClient, APIError } from "~/lib/api-client";
import { wsClient } from "~/lib/websocket-client";
import type { 
  MediaFileResponse, 
  ProjectResponse, 
  UserResponse,
  TranscriptionStatusMessage 
} from "~/lib/types";

export const meta: MetaFunction = () => {
  return [
    { title: "AI Video Editor - Editor" },
    { name: "description", content: "Professional AI-powered video editing interface" },
  ];
};

interface LoaderData {
  user: UserResponse;
  mediaFiles: MediaFileResponse[];
  projects: ProjectResponse[];
  currentProject?: ProjectResponse;
  token: string;
}

interface ActionData {
  success?: boolean;
  error?: string;
  data?: any;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token') || 
                request.headers.get('Authorization')?.replace('Bearer ', '') ||
                null;

  if (!token) {
    return redirect('/login');
  }

  try {
    // Set token for API client
    apiClient.setToken(token);

    // Fetch user data and verify token
    const user = await apiClient.getCurrentUser();
    
    // Fetch user's media files and projects in parallel
    const [mediaFiles, projects] = await Promise.all([
      apiClient.getMediaFiles(),
      apiClient.getProjects()
    ]);

    // Get current project if specified
    const projectId = url.searchParams.get('project');
    let currentProject: ProjectResponse | undefined;
    
    if (projectId) {
      try {
        currentProject = await apiClient.getProject(projectId);
      } catch (error) {
        console.warn('Failed to load current project:', error);
      }
    }

    return json<LoaderData>({
      user,
      mediaFiles,
      projects,
      currentProject,
      token,
    });

  } catch (error) {
    console.error('Loader error:', error);
    
    if (error instanceof APIError && error.status === 401) {
      return redirect('/login');
    }
    
    throw new Response('Failed to load editor data', { status: 500 });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const actionType = formData.get('actionType') as string;
  const token = formData.get('token') as string;

  if (!token) {
    return json<ActionData>({ error: 'Authentication required' }, { status: 401 });
  }

  apiClient.setToken(token);

  try {
    switch (actionType) {
      case 'uploadMedia': {
        const file = formData.get('file') as File;
        if (!file) {
          return json<ActionData>({ error: 'No file provided' }, { status: 400 });
        }

        const result = await apiClient.uploadMedia(file);
        return json<ActionData>({ success: true, data: result });
      }

      case 'createProject': {
        const name = formData.get('name') as string;
        const duration = parseFloat(formData.get('duration') as string) || 0;
        const fps = parseInt(formData.get('fps') as string) || 30;
        const resolutionWidth = parseInt(formData.get('resolutionWidth') as string) || 1920;
        const resolutionHeight = parseInt(formData.get('resolutionHeight') as string) || 1080;
        const tracksData = formData.get('tracksData') ? 
          JSON.parse(formData.get('tracksData') as string) : null;

        const result = await apiClient.createProject({
          name,
          duration,
          fps,
          resolution_width: resolutionWidth,
          resolution_height: resolutionHeight,
          tracks_data: tracksData,
        });

        return json<ActionData>({ success: true, data: result });
      }

      case 'updateProject': {
        const projectId = formData.get('projectId') as string;
        const updates: any = {};
        
        if (formData.get('name')) updates.name = formData.get('name');
        if (formData.get('duration')) updates.duration = parseFloat(formData.get('duration') as string);
        if (formData.get('fps')) updates.fps = parseInt(formData.get('fps') as string);
        if (formData.get('resolutionWidth')) updates.resolution_width = parseInt(formData.get('resolutionWidth') as string);
        if (formData.get('resolutionHeight')) updates.resolution_height = parseInt(formData.get('resolutionHeight') as string);
        if (formData.get('tracksData')) updates.tracks_data = JSON.parse(formData.get('tracksData') as string);

        const result = await apiClient.updateProject(projectId, updates);
        return json<ActionData>({ success: true, data: result });
      }

      case 'deleteProject': {
        const projectId = formData.get('projectId') as string;
        const result = await apiClient.deleteProject(projectId);
        return json<ActionData>({ success: true, data: result });
      }

      case 'deleteMedia': {
        const mediaId = formData.get('mediaId') as string;
        const result = await apiClient.deleteMediaFile(mediaId);
        return json<ActionData>({ success: true, data: result });
      }

      case 'transcribeMedia': {
        const mediaFileId = formData.get('mediaFileId') as string;
        const result = await apiClient.transcribeMedia(mediaFileId);
        return json<ActionData>({ success: true, data: result });
      }

      default:
        return json<ActionData>({ error: 'Unknown action type' }, { status: 400 });
    }

  } catch (error) {
    console.error('Action error:', error);
    
    if (error instanceof APIError) {
      return json<ActionData>({ 
        error: error.message 
      }, { 
        status: error.status || 500 
      });
    }
    
    return json<ActionData>({ 
      error: 'An unexpected error occurred' 
    }, { 
      status: 500 
    });
  }
}

export default function EditorRoute() {
  const { user, mediaFiles, projects, currentProject, token } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const revalidator = useRevalidator();
  const [wsConnected, setWsConnected] = useState(false);

  // Set up WebSocket connection for real-time updates
  useEffect(() => {
    wsClient.setToken(token);
    
    const handleConnection = () => {
      setWsConnected(true);
      console.log('WebSocket connected');
    };

    const handleDisconnection = () => {
      setWsConnected(false);
      console.log('WebSocket disconnected');
    };

    const handleTranscriptionStatus = (message: TranscriptionStatusMessage) => {
      console.log('Transcription status update:', message.data);
      
      // Revalidate data when transcription completes
      if (message.data.status === 'completed' || message.data.status === 'failed') {
        revalidator.revalidate();
      }
    };

    // Set up event listeners
    wsClient.on('connection', handleConnection);
    wsClient.on('disconnection', handleDisconnection);
    wsClient.onTranscriptionStatus(handleTranscriptionStatus);

    // Connect WebSocket
    wsClient.connect().catch(console.error);

    // Cleanup
    return () => {
      wsClient.off('connection', handleConnection);
      wsClient.off('disconnection', handleDisconnection);
      wsClient.offTranscriptionStatus(handleTranscriptionStatus);
    };
  }, [token, revalidator]);

  // Handle action results
  useEffect(() => {
    if (actionData?.success) {
      // Revalidate data after successful actions
      revalidator.revalidate();
    }
    
    if (actionData?.error) {
      console.error('Action error:', actionData.error);
      // You could show a toast notification here
    }
  }, [actionData, revalidator]);

  return (
    <AuthProvider initialToken={token}>
      <div className="h-screen bg-gray-900">
        {/* Connection status indicator */}
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            wsConnected 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {wsConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>

        <VideoEditor 
          initialMediaFiles={mediaFiles}
          initialProjects={projects}
          currentProject={currentProject}
          wsConnected={wsConnected}
        />
      </div>
    </AuthProvider>
  );
}
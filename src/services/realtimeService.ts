
import { supabase } from '@/integrations/supabase/client';

class RealtimeService {
  private activeChannels = new Map<string, any>();

  subscribeToStudyMaterials(callback: (payload: any) => void, channelName?: string) {
    const uniqueChannelName = channelName || `study_materials_${Date.now()}_${Math.random()}`;
    
    // Remove existing channel if it exists
    if (this.activeChannels.has(uniqueChannelName)) {
      const existingChannel = this.activeChannels.get(uniqueChannelName);
      supabase.removeChannel(existingChannel);
    }

    const channel = supabase
      .channel(uniqueChannelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'study_materials'
        },
        callback
      )
      .subscribe();

    this.activeChannels.set(uniqueChannelName, channel);
    return channel;
  }

  removeChannel(channel: any) {
    for (const [name, activeChannel] of this.activeChannels.entries()) {
      if (activeChannel === channel) {
        this.activeChannels.delete(name);
        break;
      }
    }
    supabase.removeChannel(channel);
  }

  cleanup() {
    for (const [name, channel] of this.activeChannels.entries()) {
      supabase.removeChannel(channel);
    }
    this.activeChannels.clear();
  }
}

export const realtimeService = new RealtimeService();

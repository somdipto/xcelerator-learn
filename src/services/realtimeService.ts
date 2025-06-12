
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

class RealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map();

  subscribeToStudyMaterials(
    callback: (payload: any) => void,
    channelName: string = 'study-materials-changes'
  ): RealtimeChannel {
    // Remove existing channel if it exists
    if (this.channels.has(channelName)) {
      this.removeChannel(this.channels.get(channelName)!);
    }

    const channel = supabase
      .channel(channelName)
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

    this.channels.set(channelName, channel);
    return channel;
  }

  removeChannel(channel: RealtimeChannel) {
    supabase.removeChannel(channel);
    
    // Remove from our tracking
    for (const [name, ch] of this.channels.entries()) {
      if (ch === channel) {
        this.channels.delete(name);
        break;
      }
    }
  }

  removeAllChannels() {
    this.channels.forEach(channel => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
  }
}

export const realtimeService = new RealtimeService();

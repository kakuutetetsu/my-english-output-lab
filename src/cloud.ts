import {createClient} from '@supabase/supabase-js';
import type {State} from './store';
import {merge,validate} from './store';
const env=(import.meta as unknown as {env:Record<string,string>}).env;
export const cloud=env.VITE_SUPABASE_URL&&env.VITE_SUPABASE_ANON_KEY?createClient(env.VITE_SUPABASE_URL,env.VITE_SUPABASE_ANON_KEY):null;
// Append-only events avoid whole-document overwrites between devices.
export async function sync(user:string,local:State){if(!cloud)return local;for(let n=0;n<local.events.length;n+=200){const {error}=await cloud.from('learning_events').upsert(local.events.slice(n,n+200).map(e=>({user_id:user,event_id:e.id,payload:e})),{onConflict:'user_id,event_id',ignoreDuplicates:true});if(error)throw error;}
let remote:State={version:1,events:[]};for(let offset=0;;offset+=1000){const {data,error}=await cloud.from('learning_events').select('payload').eq('user_id',user).order('event_id').range(offset,offset+999);if(error)throw error;remote.events.push(...(data||[]).map(r=>r.payload));if(!data||data.length<1000)break;}return merge(local,validate(remote));}

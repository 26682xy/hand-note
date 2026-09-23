import {useUserStore} from "@/stores/user";
const base = import.meta.env.VITE_API_BASE || "http://127.0.0.1:3001/api";

export async function reqDoCheckin(checkDate){
  const userStore = useUserStore();
  const res = await fetch(`${base}/checkin/do`,{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization": `Bearer ${userStore.token}`
    },
    body:JSON.stringify({checkDate})
  })
  return await res.json();
}

export async function reqCancelCheckin(checkDate){
  const userStore = useUserStore();
  const res = await fetch(`${base}/checkin/cancel`,{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization": `Bearer ${userStore.token}`
    },
    body:JSON.stringify({checkDate})
  })
  return await res.json();
}

export async function reqGetMonthCheckin(year,month){
  const userStore = useUserStore();
  const res = await fetch(`${base}/checkin/month?year=${year}&month=${month}`,{
    headers:{
      "Authorization": `Bearer ${userStore.token}`
    }
  })
  return await res.json();
}

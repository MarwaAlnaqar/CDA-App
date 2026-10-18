const API = 'https://events.dxblive.com';
async function request(path, options={}) {
 const response = await fetch(`${API}${path}`, { ...options, headers: { 'Content-Type':'application/json',...options.headers } });
 const json = await response.json().catch(()=>({}));
 if (!response.ok || json.success === false) throw new Error(json.message || `API error ${response.status}`);
 return json;
}
export async function getProtectionCards() { const result=await request('/api/protection/cards'); return result.cards || []; }
export async function saveProtectionAnswers(answers) { return request('/api/protection/answers',{method:'POST',body:JSON.stringify({answers})}); }
export async function getCertificate(journey, token) {
 return request(`/api/${journey}/certificate/${encodeURIComponent(token)}`);
}
export async function claimCertificate(journey, token, participantName) {
 return request(`/api/${journey}/certificate/claim`,{method:'POST',body:JSON.stringify({token,participantName})});
}
export async function getProtectionCertificate(token) { return getCertificate('protection', token); }
export async function claimProtectionCertificate(token, participantName) {
 return claimCertificate('protection', token, participantName);
}

export async function getAdvocacyCards() { const result=await request('/api/advocacy/cards'); return result.cards || []; }
export async function saveAdvocacyAnswers(answers) { return request('/api/advocacy/answers',{method:'POST',body:JSON.stringify({answers})}); }


export async function getEmpowermentCards() { const result=await request('/api/empowerment/cards'); return result.cards || []; }
export async function saveEmpowermentAnswers(answers) { return request('/api/empowerment/answers',{method:'POST',body:JSON.stringify({answers})}); }

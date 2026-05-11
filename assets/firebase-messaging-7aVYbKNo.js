import{r as I,_ as T,C as k,j as W,E as we,F as ze,c as v,l as Ye,v as Xe,t as Qe,u as Ze}from"./firebase-core-Ch2EBEDA.js";const et=(e,t)=>t.some(n=>e instanceof n);let ne,oe;function tt(){return ne||(ne=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function nt(){return oe||(oe=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const be=new WeakMap,F=new WeakMap,ye=new WeakMap,D=new WeakMap,H=new WeakMap;function ot(e){const t=new Promise((n,o)=>{const r=()=>{e.removeEventListener("success",i),e.removeEventListener("error",s)},i=()=>{n(g(e.result)),r()},s=()=>{o(e.error),r()};e.addEventListener("success",i),e.addEventListener("error",s)});return t.then(n=>{n instanceof IDBCursor&&be.set(n,e)}).catch(()=>{}),H.set(t,e),t}function rt(e){if(F.has(e))return;const t=new Promise((n,o)=>{const r=()=>{e.removeEventListener("complete",i),e.removeEventListener("error",s),e.removeEventListener("abort",s)},i=()=>{n(),r()},s=()=>{o(e.error||new DOMException("AbortError","AbortError")),r()};e.addEventListener("complete",i),e.addEventListener("error",s),e.addEventListener("abort",s)});F.set(e,t)}let K={get(e,t,n){if(e instanceof IDBTransaction){if(t==="done")return F.get(e);if(t==="objectStoreNames")return e.objectStoreNames||ye.get(e);if(t==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return g(e[t])},set(e,t,n){return e[t]=n,!0},has(e,t){return e instanceof IDBTransaction&&(t==="done"||t==="store")?!0:t in e}};function it(e){K=e(K)}function st(e){return e===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(t,...n){const o=e.call(C(this),t,...n);return ye.set(o,t.sort?t.sort():[t]),g(o)}:nt().includes(e)?function(...t){return e.apply(C(this),t),g(be.get(this))}:function(...t){return g(e.apply(C(this),t))}}function at(e){return typeof e=="function"?st(e):(e instanceof IDBTransaction&&rt(e),et(e,tt())?new Proxy(e,K):e)}function g(e){if(e instanceof IDBRequest)return ot(e);if(D.has(e))return D.get(e);const t=at(e);return t!==e&&(D.set(e,t),H.set(t,e)),t}const C=e=>H.get(e);function ct(e,t,{blocked:n,upgrade:o,blocking:r,terminated:i}={}){const s=indexedDB.open(e,t),a=g(s);return o&&s.addEventListener("upgradeneeded",c=>{o(g(s.result),c.oldVersion,c.newVersion,g(s.transaction))}),n&&s.addEventListener("blocked",()=>n()),a.then(c=>{i&&c.addEventListener("close",()=>i()),r&&c.addEventListener("versionchange",()=>r())}).catch(()=>{}),a}const ut=["get","getKey","getAll","getAllKeys","count"],dt=["put","add","delete","clear"],_=new Map;function re(e,t){if(!(e instanceof IDBDatabase&&!(t in e)&&typeof t=="string"))return;if(_.get(t))return _.get(t);const n=t.replace(/FromIndex$/,""),o=t!==n,r=dt.includes(n);if(!(n in(o?IDBIndex:IDBObjectStore).prototype)||!(r||ut.includes(n)))return;const i=async function(s,...a){const c=this.transaction(s,r?"readwrite":"readonly");let d=c.store;return o&&(d=d.index(a.shift())),(await Promise.all([d[n](...a),r&&c.done]))[0]};return _.set(t,i),i}it(e=>({...e,get:(t,n,o)=>re(t,n)||e.get(t,n,o),has:(t,n)=>!!re(t,n)||e.has(t,n)}));const me="@firebase/installations",U="0.6.4";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ie=1e4,Te=`w:${U}`,ke="FIS_v2",ft="https://firebaseinstallations.googleapis.com/v1",pt=60*60*1e3,lt="installations",gt="Installations";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ht={"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"not-registered":"Firebase Installation is not registered.","installation-not-found":"Firebase Installation not found.","request-failed":'{$requestName} request failed with error "{$serverCode} {$serverStatus}: {$serverMessage}"',"app-offline":"Could not process request. Application offline.","delete-pending-registration":"Can't delete installation while there is a pending registration request."},w=new we(lt,gt,ht);function Se(e){return e instanceof ze&&e.code.includes("request-failed")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ve({projectId:e}){return`${ft}/projects/${e}/installations`}function Ee(e){return{token:e.token,requestStatus:2,expiresIn:bt(e.expiresIn),creationTime:Date.now()}}async function Ae(e,t){const o=(await t.json()).error;return w.create("request-failed",{requestName:e,serverCode:o.code,serverMessage:o.message,serverStatus:o.status})}function De({apiKey:e}){return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":e})}function wt(e,{refreshToken:t}){const n=De(e);return n.append("Authorization",yt(t)),n}async function Ce(e){const t=await e();return t.status>=500&&t.status<600?e():t}function bt(e){return Number(e.replace("s","000"))}function yt(e){return`${ke} ${e}`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function mt({appConfig:e,heartbeatServiceProvider:t},{fid:n}){const o=ve(e),r=De(e),i=t.getImmediate({optional:!0});if(i){const d=await i.getHeartbeatsHeader();d&&r.append("x-firebase-client",d)}const s={fid:n,authVersion:ke,appId:e.appId,sdkVersion:Te},a={method:"POST",headers:r,body:JSON.stringify(s)},c=await Ce(()=>fetch(o,a));if(c.ok){const d=await c.json();return{fid:d.fid||n,registrationStatus:2,refreshToken:d.refreshToken,authToken:Ee(d.authToken)}}else throw await Ae("Create Installation",c)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _e(e){return new Promise(t=>{setTimeout(t,e)})}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function It(e){return btoa(String.fromCharCode(...e)).replace(/\+/g,"-").replace(/\//g,"_")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Tt=/^[cdef][\w-]{21}$/,x="";function kt(){try{const e=new Uint8Array(17);(self.crypto||self.msCrypto).getRandomValues(e),e[0]=112+e[0]%16;const n=St(e);return Tt.test(n)?n:x}catch{return x}}function St(e){return It(e).substr(0,22)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function E(e){return`${e.appName}!${e.appId}`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Me=new Map;function Oe(e,t){const n=E(e);Ne(n,t),vt(n,t)}function Ne(e,t){const n=Me.get(e);if(n)for(const o of n)o(t)}function vt(e,t){const n=Et();n&&n.postMessage({key:e,fid:t}),At()}let h=null;function Et(){return!h&&"BroadcastChannel"in self&&(h=new BroadcastChannel("[Firebase] FID Change"),h.onmessage=e=>{Ne(e.data.key,e.data.fid)}),h}function At(){Me.size===0&&h&&(h.close(),h=null)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Dt="firebase-installations-database",Ct=1,b="firebase-installations-store";let M=null;function G(){return M||(M=ct(Dt,Ct,{upgrade:(e,t)=>{switch(t){case 0:e.createObjectStore(b)}}})),M}async function S(e,t){const n=E(e),r=(await G()).transaction(b,"readwrite"),i=r.objectStore(b),s=await i.get(n);return await i.put(t,n),await r.done,(!s||s.fid!==t.fid)&&Oe(e,t.fid),t}async function Pe(e){const t=E(e),o=(await G()).transaction(b,"readwrite");await o.objectStore(b).delete(t),await o.done}async function A(e,t){const n=E(e),r=(await G()).transaction(b,"readwrite"),i=r.objectStore(b),s=await i.get(n),a=t(s);return a===void 0?await i.delete(n):await i.put(a,n),await r.done,a&&(!s||s.fid!==a.fid)&&Oe(e,a.fid),a}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function J(e){let t;const n=await A(e.appConfig,o=>{const r=_t(o),i=Mt(e,r);return t=i.registrationPromise,i.installationEntry});return n.fid===x?{installationEntry:await t}:{installationEntry:n,registrationPromise:t}}function _t(e){const t=e||{fid:kt(),registrationStatus:0};return Be(t)}function Mt(e,t){if(t.registrationStatus===0){if(!navigator.onLine){const r=Promise.reject(w.create("app-offline"));return{installationEntry:t,registrationPromise:r}}const n={fid:t.fid,registrationStatus:1,registrationTime:Date.now()},o=Ot(e,n);return{installationEntry:n,registrationPromise:o}}else return t.registrationStatus===1?{installationEntry:t,registrationPromise:Nt(e)}:{installationEntry:t}}async function Ot(e,t){try{const n=await mt(e,t);return S(e.appConfig,n)}catch(n){throw Se(n)&&n.customData.serverCode===409?await Pe(e.appConfig):await S(e.appConfig,{fid:t.fid,registrationStatus:0}),n}}async function Nt(e){let t=await ie(e.appConfig);for(;t.registrationStatus===1;)await _e(100),t=await ie(e.appConfig);if(t.registrationStatus===0){const{installationEntry:n,registrationPromise:o}=await J(e);return o||n}return t}function ie(e){return A(e,t=>{if(!t)throw w.create("installation-not-found");return Be(t)})}function Be(e){return Pt(e)?{fid:e.fid,registrationStatus:0}:e}function Pt(e){return e.registrationStatus===1&&e.registrationTime+Ie<Date.now()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Bt({appConfig:e,heartbeatServiceProvider:t},n){const o=Rt(e,n),r=wt(e,n),i=t.getImmediate({optional:!0});if(i){const d=await i.getHeartbeatsHeader();d&&r.append("x-firebase-client",d)}const s={installation:{sdkVersion:Te,appId:e.appId}},a={method:"POST",headers:r,body:JSON.stringify(s)},c=await Ce(()=>fetch(o,a));if(c.ok){const d=await c.json();return Ee(d)}else throw await Ae("Generate Auth Token",c)}function Rt(e,{fid:t}){return`${ve(e)}/${t}/authTokens:generate`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function z(e,t=!1){let n;const o=await A(e.appConfig,i=>{if(!Re(i))throw w.create("not-registered");const s=i.authToken;if(!t&&jt(s))return i;if(s.requestStatus===1)return n=$t(e,t),i;{if(!navigator.onLine)throw w.create("app-offline");const a=Kt(i);return n=Lt(e,a),a}});return n?await n:o.authToken}async function $t(e,t){let n=await se(e.appConfig);for(;n.authToken.requestStatus===1;)await _e(100),n=await se(e.appConfig);const o=n.authToken;return o.requestStatus===0?z(e,t):o}function se(e){return A(e,t=>{if(!Re(t))throw w.create("not-registered");const n=t.authToken;return xt(n)?Object.assign(Object.assign({},t),{authToken:{requestStatus:0}}):t})}async function Lt(e,t){try{const n=await Bt(e,t),o=Object.assign(Object.assign({},t),{authToken:n});return await S(e.appConfig,o),n}catch(n){if(Se(n)&&(n.customData.serverCode===401||n.customData.serverCode===404))await Pe(e.appConfig);else{const o=Object.assign(Object.assign({},t),{authToken:{requestStatus:0}});await S(e.appConfig,o)}throw n}}function Re(e){return e!==void 0&&e.registrationStatus===2}function jt(e){return e.requestStatus===2&&!Ft(e)}function Ft(e){const t=Date.now();return t<e.creationTime||e.creationTime+e.expiresIn<t+pt}function Kt(e){const t={requestStatus:1,requestTime:Date.now()};return Object.assign(Object.assign({},e),{authToken:t})}function xt(e){return e.requestStatus===1&&e.requestTime+Ie<Date.now()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Vt(e){const t=e,{installationEntry:n,registrationPromise:o}=await J(t);return o?o.catch(console.error):z(t).catch(console.error),n.fid}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function qt(e,t=!1){const n=e;return await Wt(n),(await z(n,t)).token}async function Wt(e){const{registrationPromise:t}=await J(e);t&&await t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ht(e){if(!e||!e.options)throw O("App Configuration");if(!e.name)throw O("App Name");const t=["projectId","apiKey","appId"];for(const n of t)if(!e.options[n])throw O(n);return{appName:e.name,projectId:e.options.projectId,apiKey:e.options.apiKey,appId:e.options.appId}}function O(e){return w.create("missing-app-config-values",{valueName:e})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $e="installations",Ut="installations-internal",Gt=e=>{const t=e.getProvider("app").getImmediate(),n=Ht(t),o=W(t,"heartbeat");return{app:t,appConfig:n,heartbeatServiceProvider:o,_delete:()=>Promise.resolve()}},Jt=e=>{const t=e.getProvider("app").getImmediate(),n=W(t,$e).getImmediate();return{getId:()=>Vt(n),getToken:r=>qt(n,r)}};function zt(){T(new k($e,Gt,"PUBLIC")),T(new k(Ut,Jt,"PRIVATE"))}zt();I(me,U);I(me,U,"esm2017");const Yt=(e,t)=>t.some(n=>e instanceof n);let ae,ce;function Xt(){return ae||(ae=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function Qt(){return ce||(ce=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const Le=new WeakMap,V=new WeakMap,je=new WeakMap,N=new WeakMap,Y=new WeakMap;function Zt(e){const t=new Promise((n,o)=>{const r=()=>{e.removeEventListener("success",i),e.removeEventListener("error",s)},i=()=>{n(l(e.result)),r()},s=()=>{o(e.error),r()};e.addEventListener("success",i),e.addEventListener("error",s)});return t.then(n=>{n instanceof IDBCursor&&Le.set(n,e)}).catch(()=>{}),Y.set(t,e),t}function en(e){if(V.has(e))return;const t=new Promise((n,o)=>{const r=()=>{e.removeEventListener("complete",i),e.removeEventListener("error",s),e.removeEventListener("abort",s)},i=()=>{n(),r()},s=()=>{o(e.error||new DOMException("AbortError","AbortError")),r()};e.addEventListener("complete",i),e.addEventListener("error",s),e.addEventListener("abort",s)});V.set(e,t)}let q={get(e,t,n){if(e instanceof IDBTransaction){if(t==="done")return V.get(e);if(t==="objectStoreNames")return e.objectStoreNames||je.get(e);if(t==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return l(e[t])},set(e,t,n){return e[t]=n,!0},has(e,t){return e instanceof IDBTransaction&&(t==="done"||t==="store")?!0:t in e}};function tn(e){q=e(q)}function nn(e){return e===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(t,...n){const o=e.call(P(this),t,...n);return je.set(o,t.sort?t.sort():[t]),l(o)}:Qt().includes(e)?function(...t){return e.apply(P(this),t),l(Le.get(this))}:function(...t){return l(e.apply(P(this),t))}}function on(e){return typeof e=="function"?nn(e):(e instanceof IDBTransaction&&en(e),Yt(e,Xt())?new Proxy(e,q):e)}function l(e){if(e instanceof IDBRequest)return Zt(e);if(N.has(e))return N.get(e);const t=on(e);return t!==e&&(N.set(e,t),Y.set(t,e)),t}const P=e=>Y.get(e);function Fe(e,t,{blocked:n,upgrade:o,blocking:r,terminated:i}={}){const s=indexedDB.open(e,t),a=l(s);return o&&s.addEventListener("upgradeneeded",c=>{o(l(s.result),c.oldVersion,c.newVersion,l(s.transaction))}),n&&s.addEventListener("blocked",()=>n()),a.then(c=>{i&&c.addEventListener("close",()=>i()),r&&c.addEventListener("versionchange",()=>r())}).catch(()=>{}),a}function B(e,{blocked:t}={}){const n=indexedDB.deleteDatabase(e);return t&&n.addEventListener("blocked",()=>t()),l(n).then(()=>{})}const rn=["get","getKey","getAll","getAllKeys","count"],sn=["put","add","delete","clear"],R=new Map;function ue(e,t){if(!(e instanceof IDBDatabase&&!(t in e)&&typeof t=="string"))return;if(R.get(t))return R.get(t);const n=t.replace(/FromIndex$/,""),o=t!==n,r=sn.includes(n);if(!(n in(o?IDBIndex:IDBObjectStore).prototype)||!(r||rn.includes(n)))return;const i=async function(s,...a){const c=this.transaction(s,r?"readwrite":"readonly");let d=c.store;return o&&(d=d.index(a.shift())),(await Promise.all([d[n](...a),r&&c.done]))[0]};return R.set(t,i),i}tn(e=>({...e,get:(t,n,o)=>ue(t,n)||e.get(t,n,o),has:(t,n)=>!!ue(t,n)||e.has(t,n)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const an="/firebase-messaging-sw.js",cn="/firebase-cloud-messaging-push-scope",Ke="BDOU99-h67HcA6JeFXHbSNMu7e2yNNu3RzoMj8TM4W88jITfq7ZmPvIM1Iv-4_l2LxQcYwhqby2xGpWwzjfAnG4",un="https://fcmregistrations.googleapis.com/v1",xe="google.c.a.c_id",dn="google.c.a.c_l",fn="google.c.a.ts",pn="google.c.a.e";var de;(function(e){e[e.DATA_MESSAGE=1]="DATA_MESSAGE",e[e.DISPLAY_NOTIFICATION=3]="DISPLAY_NOTIFICATION"})(de||(de={}));/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */var m;(function(e){e.PUSH_RECEIVED="push-received",e.NOTIFICATION_CLICKED="notification-clicked"})(m||(m={}));/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function p(e){const t=new Uint8Array(e);return btoa(String.fromCharCode(...t)).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_")}function ln(e){const t="=".repeat((4-e.length%4)%4),n=(e+t).replace(/\-/g,"+").replace(/_/g,"/"),o=atob(n),r=new Uint8Array(o.length);for(let i=0;i<o.length;++i)r[i]=o.charCodeAt(i);return r}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $="fcm_token_details_db",gn=5,fe="fcm_token_object_Store";async function hn(e){if("databases"in indexedDB&&!(await indexedDB.databases()).map(i=>i.name).includes($))return null;let t=null;return(await Fe($,gn,{upgrade:async(o,r,i,s)=>{var a;if(r<2||!o.objectStoreNames.contains(fe))return;const c=s.objectStore(fe),d=await c.index("fcmSenderId").get(e);if(await c.clear(),!!d){if(r===2){const u=d;if(!u.auth||!u.p256dh||!u.endpoint)return;t={token:u.fcmToken,createTime:(a=u.createTime)!==null&&a!==void 0?a:Date.now(),subscriptionOptions:{auth:u.auth,p256dh:u.p256dh,endpoint:u.endpoint,swScope:u.swScope,vapidKey:typeof u.vapidKey=="string"?u.vapidKey:p(u.vapidKey)}}}else if(r===3){const u=d;t={token:u.fcmToken,createTime:u.createTime,subscriptionOptions:{auth:p(u.auth),p256dh:p(u.p256dh),endpoint:u.endpoint,swScope:u.swScope,vapidKey:p(u.vapidKey)}}}else if(r===4){const u=d;t={token:u.fcmToken,createTime:u.createTime,subscriptionOptions:{auth:p(u.auth),p256dh:p(u.p256dh),endpoint:u.endpoint,swScope:u.swScope,vapidKey:p(u.vapidKey)}}}}}})).close(),await B($),await B("fcm_vapid_details_db"),await B("undefined"),wn(t)?t:null}function wn(e){if(!e||!e.subscriptionOptions)return!1;const{subscriptionOptions:t}=e;return typeof e.createTime=="number"&&e.createTime>0&&typeof e.token=="string"&&e.token.length>0&&typeof t.auth=="string"&&t.auth.length>0&&typeof t.p256dh=="string"&&t.p256dh.length>0&&typeof t.endpoint=="string"&&t.endpoint.length>0&&typeof t.swScope=="string"&&t.swScope.length>0&&typeof t.vapidKey=="string"&&t.vapidKey.length>0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bn="firebase-messaging-database",yn=1,y="firebase-messaging-store";let L=null;function X(){return L||(L=Fe(bn,yn,{upgrade:(e,t)=>{switch(t){case 0:e.createObjectStore(y)}}})),L}async function Ve(e){const t=Z(e),o=await(await X()).transaction(y).objectStore(y).get(t);if(o)return o;{const r=await hn(e.appConfig.senderId);if(r)return await Q(e,r),r}}async function Q(e,t){const n=Z(e),r=(await X()).transaction(y,"readwrite");return await r.objectStore(y).put(t,n),await r.done,t}async function mn(e){const t=Z(e),o=(await X()).transaction(y,"readwrite");await o.objectStore(y).delete(t),await o.done}function Z({appConfig:e}){return e.appId}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const In={"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"only-available-in-window":"This method is available in a Window context.","only-available-in-sw":"This method is available in a service worker context.","permission-default":"The notification permission was not granted and dismissed instead.","permission-blocked":"The notification permission was not granted and blocked instead.","unsupported-browser":"This browser doesn't support the API's required to use the Firebase SDK.","indexed-db-unsupported":"This browser doesn't support indexedDb.open() (ex. Safari iFrame, Firefox Private Browsing, etc)","failed-service-worker-registration":"We are unable to register the default service worker. {$browserErrorMessage}","token-subscribe-failed":"A problem occurred while subscribing the user to FCM: {$errorInfo}","token-subscribe-no-token":"FCM returned no token when subscribing the user to push.","token-unsubscribe-failed":"A problem occurred while unsubscribing the user from FCM: {$errorInfo}","token-update-failed":"A problem occurred while updating the user from FCM: {$errorInfo}","token-update-no-token":"FCM returned no token when updating the user to push.","use-sw-after-get-token":"The useServiceWorker() method may only be called once and must be called before calling getToken() to ensure your service worker is used.","invalid-sw-registration":"The input to useServiceWorker() must be a ServiceWorkerRegistration.","invalid-bg-handler":"The input to setBackgroundMessageHandler() must be a function.","invalid-vapid-key":"The public VAPID key must be a string.","use-vapid-key-after-get-token":"The usePublicVapidKey() method may only be called once and must be called before calling getToken() to ensure your VAPID key is used."},f=new we("messaging","Messaging",In);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Tn(e,t){const n=await te(e),o=We(t),r={method:"POST",headers:n,body:JSON.stringify(o)};let i;try{i=await(await fetch(ee(e.appConfig),r)).json()}catch(s){throw f.create("token-subscribe-failed",{errorInfo:s==null?void 0:s.toString()})}if(i.error){const s=i.error.message;throw f.create("token-subscribe-failed",{errorInfo:s})}if(!i.token)throw f.create("token-subscribe-no-token");return i.token}async function kn(e,t){const n=await te(e),o=We(t.subscriptionOptions),r={method:"PATCH",headers:n,body:JSON.stringify(o)};let i;try{i=await(await fetch(`${ee(e.appConfig)}/${t.token}`,r)).json()}catch(s){throw f.create("token-update-failed",{errorInfo:s==null?void 0:s.toString()})}if(i.error){const s=i.error.message;throw f.create("token-update-failed",{errorInfo:s})}if(!i.token)throw f.create("token-update-no-token");return i.token}async function qe(e,t){const o={method:"DELETE",headers:await te(e)};try{const i=await(await fetch(`${ee(e.appConfig)}/${t}`,o)).json();if(i.error){const s=i.error.message;throw f.create("token-unsubscribe-failed",{errorInfo:s})}}catch(r){throw f.create("token-unsubscribe-failed",{errorInfo:r==null?void 0:r.toString()})}}function ee({projectId:e}){return`${un}/projects/${e}/registrations`}async function te({appConfig:e,installations:t}){const n=await t.getToken();return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":e.apiKey,"x-goog-firebase-installations-auth":`FIS ${n}`})}function We({p256dh:e,auth:t,endpoint:n,vapidKey:o}){const r={web:{endpoint:n,auth:t,p256dh:e}};return o!==Ke&&(r.web.applicationPubKey=o),r}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Sn=7*24*60*60*1e3;async function vn(e){const t=await An(e.swRegistration,e.vapidKey),n={vapidKey:e.vapidKey,swScope:e.swRegistration.scope,endpoint:t.endpoint,auth:p(t.getKey("auth")),p256dh:p(t.getKey("p256dh"))},o=await Ve(e.firebaseDependencies);if(o){if(Dn(o.subscriptionOptions,n))return Date.now()>=o.createTime+Sn?En(e,{token:o.token,createTime:Date.now(),subscriptionOptions:n}):o.token;try{await qe(e.firebaseDependencies,o.token)}catch(r){console.warn(r)}return pe(e.firebaseDependencies,n)}else return pe(e.firebaseDependencies,n)}async function He(e){const t=await Ve(e.firebaseDependencies);t&&(await qe(e.firebaseDependencies,t.token),await mn(e.firebaseDependencies));const n=await e.swRegistration.pushManager.getSubscription();return n?n.unsubscribe():!0}async function En(e,t){try{const n=await kn(e.firebaseDependencies,t),o=Object.assign(Object.assign({},t),{token:n,createTime:Date.now()});return await Q(e.firebaseDependencies,o),n}catch(n){throw await He(e),n}}async function pe(e,t){const o={token:await Tn(e,t),createTime:Date.now(),subscriptionOptions:t};return await Q(e,o),o.token}async function An(e,t){const n=await e.pushManager.getSubscription();return n||e.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:ln(t)})}function Dn(e,t){const n=t.vapidKey===e.vapidKey,o=t.endpoint===e.endpoint,r=t.auth===e.auth,i=t.p256dh===e.p256dh;return n&&o&&r&&i}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function le(e){const t={from:e.from,collapseKey:e.collapse_key,messageId:e.fcmMessageId};return Cn(t,e),_n(t,e),Mn(t,e),t}function Cn(e,t){if(!t.notification)return;e.notification={};const n=t.notification.title;n&&(e.notification.title=n);const o=t.notification.body;o&&(e.notification.body=o);const r=t.notification.image;r&&(e.notification.image=r);const i=t.notification.icon;i&&(e.notification.icon=i)}function _n(e,t){t.data&&(e.data=t.data)}function Mn(e,t){var n,o,r,i,s;if(!t.fcmOptions&&!(!((n=t.notification)===null||n===void 0)&&n.click_action))return;e.fcmOptions={};const a=(r=(o=t.fcmOptions)===null||o===void 0?void 0:o.link)!==null&&r!==void 0?r:(i=t.notification)===null||i===void 0?void 0:i.click_action;a&&(e.fcmOptions.link=a);const c=(s=t.fcmOptions)===null||s===void 0?void 0:s.analytics_label;c&&(e.fcmOptions.analyticsLabel=c)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function On(e){return typeof e=="object"&&!!e&&xe in e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Ue("hts/frbslgigp.ogepscmv/ieo/eaylg","tp:/ieaeogn-agolai.o/1frlglgc/o");Ue("AzSCbw63g1R0nCw85jG8","Iaya3yLKwmgvh7cF0q4");function Ue(e,t){const n=[];for(let o=0;o<e.length;o++)n.push(e.charAt(o)),o<t.length&&n.push(t.charAt(o));return n.join("")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Nn(e){if(!e||!e.options)throw j("App Configuration Object");if(!e.name)throw j("App Name");const t=["projectId","apiKey","appId","messagingSenderId"],{options:n}=e;for(const o of t)if(!n[o])throw j(o);return{appName:e.name,projectId:n.projectId,apiKey:n.apiKey,appId:n.appId,senderId:n.messagingSenderId}}function j(e){return f.create("missing-app-config-values",{valueName:e})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pn{constructor(t,n,o){this.deliveryMetricsExportedToBigQueryEnabled=!1,this.onBackgroundMessageHandler=null,this.onMessageHandler=null,this.logEvents=[],this.isLogServiceStarted=!1;const r=Nn(t);this.firebaseDependencies={app:t,appConfig:r,installations:n,analyticsProvider:o}}_delete(){return Promise.resolve()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ge(e){try{e.swRegistration=await navigator.serviceWorker.register(an,{scope:cn}),e.swRegistration.update().catch(()=>{})}catch(t){throw f.create("failed-service-worker-registration",{browserErrorMessage:t==null?void 0:t.message})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Bn(e,t){if(!t&&!e.swRegistration&&await Ge(e),!(!t&&e.swRegistration)){if(!(t instanceof ServiceWorkerRegistration))throw f.create("invalid-sw-registration");e.swRegistration=t}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Rn(e,t){t?e.vapidKey=t:e.vapidKey||(e.vapidKey=Ke)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Je(e,t){if(!navigator)throw f.create("only-available-in-window");if(Notification.permission==="default"&&await Notification.requestPermission(),Notification.permission!=="granted")throw f.create("permission-blocked");return await Rn(e,t==null?void 0:t.vapidKey),await Bn(e,t==null?void 0:t.serviceWorkerRegistration),vn(e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function $n(e,t,n){const o=Ln(t);(await e.firebaseDependencies.analyticsProvider.get()).logEvent(o,{message_id:n[xe],message_name:n[dn],message_time:n[fn],message_device_time:Math.floor(Date.now()/1e3)})}function Ln(e){switch(e){case m.NOTIFICATION_CLICKED:return"notification_open";case m.PUSH_RECEIVED:return"notification_foreground";default:throw new Error}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function jn(e,t){const n=t.data;if(!n.isFirebaseMessaging)return;e.onMessageHandler&&n.messageType===m.PUSH_RECEIVED&&(typeof e.onMessageHandler=="function"?e.onMessageHandler(le(n)):e.onMessageHandler.next(le(n)));const o=n.data;On(o)&&o[pn]==="1"&&await $n(e,n.messageType,o)}const ge="@firebase/messaging",he="0.12.4";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Fn=e=>{const t=new Pn(e.getProvider("app").getImmediate(),e.getProvider("installations-internal").getImmediate(),e.getProvider("analytics-internal"));return navigator.serviceWorker.addEventListener("message",n=>jn(t,n)),t},Kn=e=>{const t=e.getProvider("messaging").getImmediate();return{getToken:o=>Je(t,o)}};function xn(){T(new k("messaging",Fn,"PUBLIC")),T(new k("messaging-internal",Kn,"PRIVATE")),I(ge,he),I(ge,he,"esm2017")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Vn(){try{await Xe()}catch{return!1}return typeof window<"u"&&Qe()&&Ze()&&"serviceWorker"in navigator&&"PushManager"in window&&"Notification"in window&&"fetch"in window&&ServiceWorkerRegistration.prototype.hasOwnProperty("showNotification")&&PushSubscription.prototype.hasOwnProperty("getKey")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function qn(e){if(!navigator)throw f.create("only-available-in-window");return e.swRegistration||await Ge(e),He(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Wn(e,t){if(!navigator)throw f.create("only-available-in-window");return e.onMessageHandler=t,()=>{e.onMessageHandler=null}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Un(e=Ye()){return Vn().then(t=>{if(!t)throw f.create("unsupported-browser")},t=>{throw f.create("indexed-db-unsupported")}),W(v(e),"messaging").getImmediate()}async function Gn(e,t){return e=v(e),Je(e,t)}function Jn(e){return e=v(e),qn(e)}function zn(e,t){return e=v(e),Wn(e,t)}xn();export{Jn as deleteToken,Un as getMessaging,Gn as getToken,Vn as isSupported,zn as onMessage};

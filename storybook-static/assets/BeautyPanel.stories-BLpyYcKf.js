import{n as e}from"./chunk-BneVvdWh.js";import{t}from"./iframe-BF3bG1CA.js";function n({settings:e,isEnabled:t,onSettingChange:n,onToggle:a,onReset:o}){return(0,i.jsxs)(`div`,{className:`space-y-4`,children:[(0,i.jsxs)(`div`,{className:`flex items-center justify-between`,children:[(0,i.jsx)(`h3`,{className:`font-semibold text-sm`,children:`Beauty Effects`}),(0,i.jsx)(`button`,{onClick:a,className:`relative w-10 h-5 rounded-full transition-colors ${t?`bg-primary`:`bg-muted`}`,children:(0,i.jsx)(`span`,{className:`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${t?`translate-x-5`:``}`})})]}),t&&(0,i.jsxs)(`div`,{className:`space-y-3`,children:[(0,i.jsx)(r,{label:`Smoothing`,value:e.smoothing,min:0,max:100,onChange:e=>n(`smoothing`,e)}),(0,i.jsx)(r,{label:`Whitening`,value:e.whitening,min:0,max:100,onChange:e=>n(`whitening`,e)}),(0,i.jsx)(r,{label:`Face Slimming`,value:e.faceSlimming,min:0,max:100,onChange:e=>n(`faceSlimming`,e)}),(0,i.jsx)(r,{label:`Skin Tone`,value:e.skinTone,min:0,max:100,onChange:e=>n(`skinTone`,e)}),(0,i.jsx)(`button`,{onClick:o,className:`w-full text-xs text-muted-foreground hover:text-foreground transition-colors`,children:`Reset to defaults`})]})]})}function r({label:e,value:t,min:n,max:r,onChange:a}){return(0,i.jsxs)(`div`,{className:`space-y-1`,children:[(0,i.jsxs)(`div`,{className:`flex justify-between text-xs`,children:[(0,i.jsx)(`span`,{className:`text-muted-foreground`,children:e}),(0,i.jsx)(`span`,{children:t})]}),(0,i.jsx)(`input`,{type:`range`,min:n,max:r,value:t,onChange:e=>a(Number(e.target.value)),className:`w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary`})]})}var i,a=e((()=>{i=t(),n.__docgenInfo={description:``,methods:[],displayName:`BeautyPanel`,props:{settings:{required:!0,tsType:{name:`BeautySettings`},description:``},isEnabled:{required:!0,tsType:{name:`boolean`},description:``},onSettingChange:{required:!0,tsType:{name:`signature`,type:`function`,raw:`<K extends keyof BeautySettings>(key: K, value: BeautySettings[K]) => void`,signature:{arguments:[{type:{name:`K`},name:`key`},{type:{name:`BeautySettings[K]`,raw:`BeautySettings[K]`},name:`value`}],return:{name:`void`}}},description:``},onToggle:{required:!0,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:``},onReset:{required:!0,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:``}}}})),o,s=e((()=>{o={smoothing:30,whitening:20,faceSlimming:0,skinTone:50}})),c,l,u,d,f;e((()=>{a(),s(),c={title:`Beauty/BeautyPanel`,component:n,tags:[`autodocs`]},l={args:{settings:o,isEnabled:!1,onSettingChange:(e,t)=>console.log(e,t),onToggle:()=>console.log(`toggled`),onReset:()=>console.log(`reset`)}},u={args:{settings:o,isEnabled:!0,onSettingChange:(e,t)=>console.log(e,t),onToggle:()=>console.log(`toggled`),onReset:()=>console.log(`reset`)}},d={args:{settings:{smoothing:70,whitening:50,faceSlimming:30,skinTone:60},isEnabled:!0,onSettingChange:(e,t)=>console.log(e,t),onToggle:()=>console.log(`toggled`),onReset:()=>console.log(`reset`)}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    settings: defaultBeautySettings,
    isEnabled: false,
    onSettingChange: (key: string, value: number) => console.log(key, value),
    onToggle: () => console.log("toggled"),
    onReset: () => console.log("reset")
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    settings: defaultBeautySettings,
    isEnabled: true,
    onSettingChange: (key: string, value: number) => console.log(key, value),
    onToggle: () => console.log("toggled"),
    onReset: () => console.log("reset")
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    settings: {
      smoothing: 70,
      whitening: 50,
      faceSlimming: 30,
      skinTone: 60
    },
    isEnabled: true,
    onSettingChange: (key: string, value: number) => console.log(key, value),
    onToggle: () => console.log("toggled"),
    onReset: () => console.log("reset")
  }
}`,...d.parameters?.docs?.source}}},f=[`Default`,`Enabled`,`CustomSettings`]}))();export{d as CustomSettings,l as Default,u as Enabled,f as __namedExportsOrder,c as default};